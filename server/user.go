package server

type User struct {
  Name string `json:"name"`
  Password string `json:"password"`
  Email string `json:"email"`
  Data string `json:"data"`
}

func NewUser (name string,  password string, email string, data string) {

}
