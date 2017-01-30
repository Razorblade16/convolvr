package convolvr

import (
	"fmt"
	"encoding/json"
	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/asdine/storm"
  "github.com/asdine/storm/q"
	"github.com/ds0nt/nexus"
	"github.com/spf13/viper"
	"golang.org/x/net/websocket"
)

var (
	hub *nexus.Nexus
	db  *storm.DB
)

func Start(configName string) {
	viper.SetConfigName(configName)        // name of config file (without extension)
	viper.AddConfigPath("$HOME/.convolvr") // call multiple times to add many search paths
	viper.AddConfigPath(".")               // optionally look for config in the working directory
	err := viper.ReadInConfig()            // Find and read the config file
	if err != nil {                        // Handle errors reading the config file
		panic(fmt.Errorf("Fatal error config file: %s \n", err))
	}
	port := fmt.Sprintf(":%d", viper.GetInt("host.port"))

	e := echo.New()
	e.Use(middleware.CORS())
	hub = nexus.NewNexus()
	db, err = storm.Open(viper.GetString("datastore.spark.db"))
	defer db.Close()
	if err != nil {
		log.Fatal(err)
	}
	userErr := db.Init(&User{})
	worldErr := db.Init(&World{})
	chunkErr := db.Init(&Chunk{})
	componentErr := db.Init(&Component{})
	entityErr := db.Init(&Entity{})
	structureErr := db.Init(&Structure{})
  // indexErr := db.ReIndex(&World{})
  // if indexErr != nil {
  // log.Fatal(indexErr)
  // }
	if userErr != nil {
		log.Fatal(userErr)
	}
	if worldErr != nil {
		log.Fatal(worldErr)
	}
	if chunkErr != nil {
		log.Fatal(chunkErr)
	}
	if componentErr != nil {
		log.Fatal(componentErr)
	}
	if entityErr != nil {
		log.Fatal(entityErr)
	}
	if structureErr != nil {
		log.Fatal(structureErr)
	}
	api := e.Group("/api")
	api.GET("/users", getUsers)
	api.POST("/users", postUsers)
	api.GET("/worlds", getWorlds)
	api.GET("/worlds/name/:name", getWorld)
	api.GET("/chunks/:worldId/:chunks", getWorldChunks)
	api.POST("/worlds", postWorlds)
	api.GET("/structures", getStructures)
	api.POST("/structures", postStructures)
	api.GET("/structures/:userId", getStructuresByUser)
	api.GET("/entities", getEntities)
	api.POST("/entities", postEntities)
	api.GET("/entities/:userId", getEntitiesByUser)
	api.GET("/components", getComponents)
	api.POST("/components", postComponents)
	api.GET("/files/list/:username/:dir", listFiles)
	api.GET("/files/list/:username", listFiles)
	api.GET("/files/download/:username/:dir/:filename", getFiles)
	api.POST("/files/upload/:username/:dir", postFiles)
	api.POST("/files/upload/:username", postFiles)
	api.POST("/files/upload-multiple/:username/:dir", postMultipleFiles)
	api.POST("/files/upload-multiple/:username", postMultipleFiles)
	api.GET("/directories/list/:username/:dir", getDirectories)
	api.GET("/directories/list/:username", getDirectories)
	api.POST("/directories/:username/:dir", postDirectories)
	api.GET("/documents/:username/:dir/:filename", getText)
	api.POST("/documents/:username/:dir/:filename", postText)

	e.Static("/", "../web")
	e.Static("/world/:name", "../web/index.html") // eventually make this route name configurable to the specific use case, 'world', 'venue', 'event', etc..
	e.File("/hyperspace", "../web/index.html") // client should generate a meta-world out of (portals to) networked convolvr sites
	e.File("/worlds", "../web/index.html")
	e.File("/worlds/new", "../web/index.html")
	e.File("/chat", "../web/index.html")
	e.File("/login", "../web/index.html")
	e.File("/settings", "../web/index.html")

	hub.Handle("chat message", chatMessage)
	hub.Handle("update", update)
	hub.Handle("tool action", toolAction)
	e.GET("/connect", nexusHandler)

	e.Logger.Fatal(e.Start(port))
}

func nexusHandler(c echo.Context) error {
	websocket.Handler(hub.Serve).ServeHTTP(c.Response(), c.Request())
	return nil
}

func chatMessage(c *nexus.Client, p *nexus.Packet) {
	log.Printf(`broadcasting chat message "%s"`, p.Data)
	hub.All().Broadcast(p)
}
func update(c *nexus.Client, p *nexus.Packet) {
	// log.Printf(`broadcasting update "%s"`, p.Data)./
	hub.All().Broadcast(p)
}
func toolAction(c *nexus.Client, p *nexus.Packet) {
	var (
		action ToolAction
		chunkData []Chunk
		entities []*Entity
		entity Entity
	)
	if err := json.Unmarshal([]byte(p.Data), &action); err != nil {
			 panic(err)
	}
	if action.Tool == "Entity Tool" || action.Tool == "Structure Tool" {
		getChunkErr := db.Select(q.And(
			q.Eq("X", action.Coords[0]),
			q.Eq("Y", action.Coords[1]),
			q.Eq("Z", action.Coords[2]),
			q.Eq("World", action.World),
		)).Find(&chunkData)
		if getChunkErr != nil {
			log.Println(getChunkErr)
		}
		nChunks := len(chunkData)
		if (nChunks > 0) {
				if action.Tool == "Entity Tool" {
					entities = chunkData[0].Entities
					if (len(entities) < 48) {
						entity = *NewEntity(0, "", action.World, action.Entity.Components, action.Entity.Aspects, action.Position, action.Quaternion, action.Entity.TranslateZ)
						entities = append(entities, &entity)
						chunkData[0].Entities = entities
						saveErr := db.Update(&chunkData[0])
						if saveErr != nil {
							log.Println(saveErr)
						}
					} else {
						log.Println("Too Many Entities:")
						log.Printf(`world: "%s"`, action.World)
						log.Printf(`x: "%s"`, action.Coords[0])
						log.Printf(`z: "%s"`, action.Coords[2])
					}
				} else { // structure tool
					// implement adding structure
				}
				log.Printf(`broadcasting tool action: "%s"`, action.Tool)    // modify chunk where this tool was used...
		}
	}
	hub.All().Broadcast(p)
}
