import { server } from "./config";

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

const joinGame = async (code: number, token: string) => {
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

export { createGame, joinGame, login };
