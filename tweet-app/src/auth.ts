import useStorage from "./hooks";
import jwt_decode from "jwt-decode";
import { useContext, createContext } from "react";
import { login, getPlayerStats, getPlayerKeyboards, changeName } from "./api";

export interface Stats {
  Points: number;
  AvgSpeed: number;
  BestSpeed: number;
  MatchesWon: number;
  AvgAccuracy: number;
  MatchesPlayed: number;
}

export interface User {
  name: string;
  email: string;
  token: string;
  picture: string;
}

export interface GoogleAuthResponse {
  clientId: string;
  client_id: string;
  credential: string;
  select_by: string;
}

const emptyStats: Stats = {
  Points: 0,
  AvgSpeed: 0,
  BestSpeed: 0,
  MatchesWon: 0,
  AvgAccuracy: 0,
  MatchesPlayed: 0,
};

const defaultGuest: User = {
  name: "guest",
  token: "",
  email: "",
  picture: "",
};

const AuthContext = createContext({
  user: defaultGuest,
  signIn: async (response: GoogleAuthResponse) => {},
  signOut: () => {},
  changeName: async (username: string) => {},
  getStats: async () => emptyStats,
  getKeyboards: async () => [] as string[],
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

  const changeName = async (newName: string) => {
    if (user.token === "") {
      setUser({ ...user, name: newName });
    } else {
      await changeName(user.token);
      setUser({ ...user, name: newName });
    }
  };

  const getStats = async () => {
    if (user.token === "") {
      return emptyStats;
    } else {
      let data: Stats = await getPlayerStats(user.token);
      return data;
    }
  };

  const getKeyboards = async () => {
    if (user.token === "") {
      return [];
    } else {
      let data = await getPlayerKeyboards(user.token);
      return data;
    }
  };

  return { user, signIn, signOut, changeName, getStats, getKeyboards };
};

export { AuthContext, useAuth, useProviderAuth };
