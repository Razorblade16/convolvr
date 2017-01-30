package convolvr

import (
	"net/http"
	log "github.com/Sirupsen/logrus"
	"github.com/labstack/echo"
)

type Structure struct {
	ID         int       `storm:"id,increment" json:"id"`
	Name       string    `storm:"unique" json:"name"`
	Geometry   string    `json:"geometry"`
	Material   string    `json:"material"`
	Entities   []*Entity `storm:"inline" json:"entities"`
	Voxels     []*Voxel  `storm:"inline" json:"voxels"`
	Position   []int     `json:"position"`
	Quaternion []int     `json:"quaternion"`
	Floors     int       `json:"floors"`
	Length     int       `json:"length"`
	Width      int       `json:"width"`
	Light      int       `json:"light"` // hex color
}

func NewStructure(id int, name string, geom string, mat string, entities []*Entity, voxels []*Voxel, pos []int, quat []int, length int, width int, floors int, light int) *Structure {
	return &Structure{id, name, geom, mat, entities, voxels, pos, quat, length, width, floors, light}
}

func getStructures(c echo.Context) error { // structure types
	var structures []Structure
	err := db.All(&structures)
	if err != nil {
		log.Println(err)
		return err
	}
	return c.JSON(http.StatusOK, &structures)
}

func postStructures(c echo.Context) error {
	var (
		structure *Structure
	)
	structure = new(Structure)
	if err := c.Bind(&structure); err != nil {
		return err
	}
	dbErr := db.Save(&structure)
	if dbErr != nil {
		log.Println(dbErr)
		return dbErr
	}
	return c.JSON(http.StatusOK, nil)
}

func getStructuresByUser(c echo.Context) error { // custom structure types
	return c.JSON(http.StatusOK, nil)
}
