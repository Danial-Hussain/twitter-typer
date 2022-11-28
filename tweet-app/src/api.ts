import { server } from "./config";
import { KeyboardData } from "./Keyboards";

const createGame = async (token: string) => {
  const response = await fetch(`${server}/createGame`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
  });
  const data: number = await response.json();
  return data;
};

const joinGame = async (code: number) => {
  const response = await fetch(`${server}/joinGame?id=${code}`, {
    method: "GET",
    mode: "cors",
  });
  const status = response.status;
  if (status === 200) {
    return true;
  } else {
    return false;
  }
};

const login = async (name: string, email: string, picture: string) => {
  try {
    const response = await fetch(`${server}/signin`, {
      method: "POST",
      mode: "cors",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        name: name,
        email: email,
        picture: picture,
      }),
    });
    if (response.status == 200) {
      let data: string = await response.json();
      return data;
    } else {
      return "";
    }
  } catch (err) {
    return "";
  }
};

const getPlayerStats = async (token: string) => {
  const response = await fetch(`${server}/playerStats`, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
  });
  let data: {
    Points: number;
    AvgSpeed: number;
    BestSpeed: number;
    MatchesWon: number;
    AvgAccuracy: number;
    MatchesPlayed: number;
  } = await response.json();
  return data;
};

const getPlayerKeyboards = async (token: string) => {
  const response = await fetch(`${server}/playerKeyboards`, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
  });
  let data: KeyboardData[] = await response.json();
  return data;
};

const changePlayerName = async (token: string, name: string) => {
  await fetch(`${server}/changeName`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      name: name,
    }),
  });
};

const changePlayerKeyboard = async (token: string, keyboardId: number) => {
  await fetch(`${server}/changeKeyboard`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      keyboardId: keyboardId,
    }),
  });
};

const getAllKeyboards = async () => {
  let response = await fetch(`${server}/keyboards`, {
    method: "GET",
    mode: "cors",
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });
  let data: KeyboardData[] = await response.json();
  return data;
};

export {
  createGame,
  joinGame,
  login,
  getPlayerStats,
  getPlayerKeyboards,
  changePlayerName,
  changePlayerKeyboard,
  getAllKeyboards,
};
