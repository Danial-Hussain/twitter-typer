import { login } from "./api";
import useStorage from "./hooks";
import jwt_decode from "jwt-decode";
import { useContext, createContext } from "react";

interface User {
  name: string;
  email: string;
  token: string;
  picture: string;
}

interface GoogleAuthResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
}

const defaultGuest: User = {
  name: "guest",
  token: "",
  email: "",
  picture: "",
};

const AuthContext = createContext({
  user: defaultGuest,
  signIn: (response: GoogleAuthResponse) => {},
  signOut: () => {},
  changeName: (username: string) => {},
});

const useAuth = () => useContext(AuthContext);

const useProviderAuth = () => {
  const [userGuest] = useStorage<User>("userGuest", defaultGuest);
  const [user, setUser] = useStorage<User>("userLoggedIn", userGuest);

  const signIn = async (response: GoogleAuthResponse) => {
    let object: User = jwt_decode(response.credential);
    let email = object.email;
    let name = object.name;
    let picture = object.picture;
    let token = await login(name, email, picture);
    if (token === "") {
      setUser(userGuest);
    } else {
      setUser({
        email: email,
        name: name,
        picture: picture,
        token: token,
      });
    }
  };

  const signOut = () => {
    setUser(userGuest);
  };

  const changeName = (newName: string) => {
    if (user.token === "") {
      setUser({ ...user, name: newName });
    } else {
      setUser({ ...user, name: newName });
    }
  };

  return { user, signIn, signOut, changeName };
};

export { AuthContext, useAuth, useProviderAuth };
