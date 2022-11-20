import { login } from "./api";
import useStorage from "./hooks";
import jwt_decode from "jwt-decode";
import { GameResult, Keyboard } from "./logic";
import { useContext, createContext } from "react";

interface User {
  name: string;
  email: string;
  token: string;
  picture: string;
  username: string;
  keyboards: Keyboard[];
  gameResults: GameResult[];
}

interface GoogleAuthResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
}

const defaultGuest: User = {
  name: "",
  token: "",
  email: "",
  picture: "",
  username: "guest",
  keyboards: [],
  gameResults: [],
};

const AuthContext = createContext({
  user: defaultGuest,
  signIn: (response: GoogleAuthResponse) => {},
  signOut: () => {},
  changeUsername: (username: string) => {},
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
    let data = await login(email, name, picture);
    if (data.token === "") {
      setUser(userGuest);
    } else {
      setUser({
        email: email,
        name: name,
        picture: picture,
        username: data.username,
        token: data.token,
        keyboards: data.keyboards,
        gameResults: data.gameResults,
      });
    }
  };

  const signOut = () => {
    setUser(userGuest);
  };

  const changeUsername = (username: string) => {
    if (user.token === "") {
      setUser({ ...user, username: username });
    } else {
      setUser({ ...user, username: username });
    }
  };

  return { user, signIn, signOut, changeUsername };
};

export { AuthContext, useAuth, useProviderAuth };
