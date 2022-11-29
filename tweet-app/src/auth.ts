import useStorage from "./hooks";
import jwt_decode from "jwt-decode";
import { KeyboardData } from "./Keyboards";
import { useContext, createContext } from "react";
import {
  login,
  getPlayerStats,
  getPlayerKeyboards,
  changePlayerName,
  changePlayerKeyboard,
  getUnlockedKeyboards,
} from "./api";

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

const defaultKeyboard: KeyboardData = {
  id: 0,
  name: "Default",
  link: "/keyboards/Default@1-1024x1024.jpg",
  pointsNeeded: 0,
  selected: true,
  keyboardUnlocked: true,
};

const AuthContext = createContext({
  user: defaultGuest,
  signIn: async (response: GoogleAuthResponse) => {},
  signOut: () => {},
  changeName: async (username: string) => {},
  changeKeyboard: async (keyboardId: number) => {},
  getStats: async () => emptyStats,
  getKeyboards: async () => [] as KeyboardData[],
  getNewUnlockedKeyboards: async () => [] as KeyboardData[],
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
      await changePlayerName(user.token, newName);
      setUser({ ...user, name: newName });
    }
  };

  const changeKeyboard = async (keyboardId: number) => {
    if (user.token === "") {
      return;
    } else {
      await changePlayerKeyboard(user.token, keyboardId);
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
      // Guest players only get the default keyboard
      return [defaultKeyboard];
    } else {
      let data = await getPlayerKeyboards(user.token);
      return data;
    }
  };

  const getNewUnlockedKeyboards = async () => {
    if (user.token === "") {
      // Guest players can't unlock keyboards
      return [];
    } else {
      let data = await getUnlockedKeyboards(user.token);
      return data;
    }
  };

  return {
    user,
    signIn,
    signOut,
    changeName,
    changeKeyboard,
    getStats,
    getKeyboards,
    getNewUnlockedKeyboards,
  };
};

export { AuthContext, useAuth, useProviderAuth };
