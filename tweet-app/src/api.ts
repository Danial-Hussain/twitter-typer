import { server } from "./config";
import { GameResult, Keyboard } from "./logic";

const createGame = async () => {
  const response = await fetch(`${server}/createGame`, {
    method: "POST",
    mode: "cors",
    headers: new Headers({
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

interface SignInResponse {
  token: string;
  username: string;
  gameResults: GameResult[];
  keyboards: Keyboard[];
}

const login = async (name: string, email: string, picture: string) => {
  const err_result = {
    token: "",
    username: "",
    gameResults: [],
    keyboards: [],
  };
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
      let data: SignInResponse = await response.json();
      return data;
    } else {
      return err_result;
    }
  } catch (err) {
    return err_result;
  }
};

export { createGame, joinGame, login };
