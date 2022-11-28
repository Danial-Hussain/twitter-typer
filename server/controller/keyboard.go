package controller

import "fmt"

type Keyboard struct {
	Id              int    `json:"id"`
	Name            string `json:"name"`
	ClientImageLink string `json:"link"`
	PointsNeeded    int    `json:"pointsNeeded"`
}

var Keyboards []Keyboard = []Keyboard{
	{
		Id:              0,
		Name:            "Default",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "Default"),
		PointsNeeded:    0,
	},
	{
		Id:           1,
		Name:         "Bamboo",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "Bamboo"),
		PointsNeeded: 5000,
	},
	{
		Id:           2,
		Name:         "RGB",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "RGB"),
		PointsNeeded: 10000,
	},
	{
		Id:           3,
		Name:         "Autumn",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "Autumn"),
		PointsNeeded: 20000,
	},
	{
		Id:           4,
		Name:         "Navy",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "Navy"),
		PointsNeeded: 40000,
	},
	{
		Id:           5,
		Name:         "Snow",
		ClientImageLink: fmt.Sprintf("/keyboards/%s@1-1024x1024.jpg", "Snow"),
		PointsNeeded: 100000,
	},
}