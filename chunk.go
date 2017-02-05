package convolvr

import (
	"math"
	"strings"
	"strconv"
  "math/rand"
	"net/http"
	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
)

type Chunk struct {
	ID         int		      `storm:"id,increment" json:"id"`
	X          int          `storm:"index" json:"x"`
	Y          int          `storm:"index" json:"y"`
	Z          int          `storm:"index" json:"z"`
	Altitude   float32 		    `json:"altitude"`
	World	     string       `storm:"id" json:"world"`
	Name       string       `json:"name"`
	Geometry   string       `json:"geometry"`
	Material   string       `json:"material"`
	Color      int			    `json:"color"`
	Structures []Structure  `json:"structures"`
	Voxels     []*Voxel     `json:"voxels"`
	Entities   []*Entity    `json:"entities"`
}

func NewChunk(id int, x int, y int, z int, alt float32, world string, name string, geom string, mat string, color int, structures []Structure, voxels []*Voxel, entities []*Entity) *Chunk {
	return &Chunk{id, x, y, z, alt, world, name, geom, mat, color, structures, voxels, entities}
}

func getWorldChunks(c echo.Context) error {
  var (
		worldData World
    generatedChunk Chunk
    chunksData []Chunk
    foundChunks []Chunk
		structures []Structure
		structure Structure
		entities []*Entity
  )
	chunk := c.Param("chunks")
	world := c.Param("worldId")
	chunks := strings.Split(chunk, ",")
  worldErr := db.One("Name", world, &worldData)
  if worldErr != nil {
    log.Println(worldErr)
	}
	voxels := db.From("World_"+world)
	for _, v := range chunks {
	    coords := strings.Split(v, "x")
	    x, xErr := strconv.Atoi(coords[0])
	    y, yErr := strconv.Atoi(coords[1])
	    z, zErr := strconv.Atoi(coords[2])
	    if xErr != nil {
	      log.Println(xErr)
	    }
	    if yErr != nil {
	      log.Println(yErr)
	    }
	    if zErr != nil {
	      log.Println(zErr)
	    }
			voxel := voxels.From("X_"+coords[0]).From("Y_"+coords[1]).From("Z_"+coords[2])
			voxel.All(&foundChunks)
			voxel.All(&entities)
	    if len(foundChunks) == 0 {
	      chunkGeom := "flat"
	      if rand.Intn(10) < 6 {
	        chunkGeom = "space"
	      } else {
			  if rand.Intn(26) > 23{
				  light := 0
				  if rand.Intn(6) > 3 {
					  if rand.Intn(5) > 4 {
							light = 0xffffff
						} else {
							if rand.Intn(4) > 2 {
								light = 0x3000ff
							} else {
								if rand.Intn(4) > 2 {
									light = 0x8000ff
								} else {
									light = 0x00ff00
								}
							}
						}
				  }
				  structure = *NewStructure(0, "test", "box", "plastic", nil, nil, []int{0,0,0}, []int{0,0,0,0}, 1+rand.Intn(7), 1+rand.Intn(3), 1+rand.Intn(3), light)
	    		structures = append(structures, structure)
			  }
		  }
		  bright := 100 + rand.Intn(155)
		  color := (bright << 16) | (bright << 8) | bright
			altitude := float32(0)
			if (worldData.Terrain.TerrainType == "voxels" ||
					worldData.Terrain.TerrainType == "both") {
					altitude = float32((math.Sin(float64(x)/2)*9+math.Cos(float64(z)/2)*9) / worldData.Terrain.Flatness)
			}
		  generatedChunk = *NewChunk(0, x, y, z, altitude, world, "", chunkGeom, "metal", color, structures, nil, nil)
	      chunksData = append(chunksData, generatedChunk)
	      saveErr := voxel.Save(&generatedChunk)
	      if saveErr != nil {
	        log.Println(saveErr)
	      }
				initErr := voxel.Init(&Entity{})
				if initErr != nil {
					log.Println(initErr)
				}
				initErr = voxel.Init(&Structure{})
				if initErr != nil {
					log.Println(initErr)
				}
	    } else {
				foundChunks[0].Entities = entities
	      chunksData = append(chunksData, foundChunks[0])
	    }
	}
	return c.JSON(http.StatusOK, &chunksData)
}
