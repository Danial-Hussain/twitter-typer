import { socket } from "./config";
import { useState, useEffect } from "react";

/* Actions */
export type Action =
  | RegisterPlayerAction
  | IsPlayerCreatorAction
  | StartCountdownAction
  | PlayerMoveAction
  | PlayerGuessAction
  | PingAction;

interface RegisterPlayerAction {
  action: "registerPlayer";
  data: { name: string };
}

interface IsPlayerCreatorAction {
  action: "isPlayerCreator";
}

interface StartCountdownAction {
  action: "startCountdown";
}

interface PlayerMoveAction {
  action: "playerMove";
  data: { key: string };
}

interface PlayerGuessAction {
  action: "playerGuess";
  data: { guess: string };
}

interface PingAction {
  action: "ping";
}

/* Messages */
export type Message =
  | SendGameTypeMessage
  | SendActivePlayersMessage
  | StartCountdownMessage
  | StartGameMessage
  | StartFinishMessage
  | PongMessage;

interface SendGameTypeMessage {
  action: "sendGameType";
  data: GameType;
}

interface SendActivePlayersMessage {
  action: "sendActivePlayers";
  data: Player[];
}

interface StartCountdownMessage {
  action: "startCountdown";
  data: GameState;
}

interface StartGameMessage {
  action: "startGame";
  data: { state: GameState; tweet: string; authorChoices: string[] };
}

interface StartFinishMessage {
  action: "startFinish";
  data: { state: GameState; author: string; authorHandle: string };
}

interface PongMessage {
  action: "pong";
}

/* Game Logic */
type PlayerState = "Typing" | "Guessing" | "Completed";

type GameState = "Lobby" | "Countdown" | "Started" | "Finished";

type GameType = "PublicGame" | "PrivateGame";

type PerformAction = (action: Action) => void;

export interface Keyboard {
  id: number;
  name: string;
}

export interface GameResult {
  gameId: number;
  accuracy: number;
  placement: number;
  gameEndTime: string;
  gameStartTime: string;
}

export interface Tweet {
  tweet: string;
  author: string;
  authorHandle: string;
  authorChoices: string[];
}

export interface Player {
  name: string;
  speed: number;
  points: number;
  isUser: boolean;
  placement: number;
  isCreator: boolean;
  state: PlayerState;
  keyboardLink: string;
  correctAnswers: number;
  incorrectAnswers: number;
  currentLetterIdx: number;
}

export interface GameManager {
  tweet: Tweet;
  gameId: string;
  state: GameState;
  players: Player[];
  playerName: string;
  timeLimit: number;
  gameType: GameType;
}

export function useGameManager(
  token: string,
  gameId: string,
  playerName: string
): [GameManager, PerformAction] {
  const [performAction, setPerformAction] = useState<PerformAction>(() => {});
  const [gameManager, setGameManager] = useState<GameManager>({
    tweet: { tweet: "", author: "", authorHandle: "", authorChoices: [] },
    players: [],
    state: "Lobby",
    gameId: gameId,
    playerName: playerName,
    timeLimit: 45,
    gameType: "PrivateGame",
  });

  const PING_RATE = 30000;

  useEffect(() => {
    const soc = new WebSocket(`${socket}?id=${gameId}&token=${token}`);

    soc.onopen = () => {
      setPerformAction(() => (action: Action) => {
        soc.send(JSON.stringify(action));
      });
      soc.send(
        JSON.stringify({
          action: "registerPlayer",
          data: { name: gameManager.playerName },
        })
      );
      soc.send(
        JSON.stringify({
          action: "ping",
        })
      );
    };

    soc.onmessage = (evt) => {
      const message: Message = JSON.parse(evt.data);

      switch (message.action) {
        case "pong":
          setTimeout(
            () => soc.send(JSON.stringify({ action: "ping" })),
            PING_RATE
          );
          break;
        case "sendGameType":
          setGameManager((gameManager) => ({
            ...gameManager,
            gameType: message.data,
          }));
          break;
        case "sendActivePlayers":
          setGameManager((gameManager) => ({
            ...gameManager,
            players: message.data,
          }));
          break;
        case "startCountdown":
          setGameManager((gameManager) => ({
            ...gameManager,
            state: message.data,
          }));
          break;
        case "startGame":
          setGameManager((gameManager) => ({
            ...gameManager,
            state: message.data.state,
            tweet: {
              tweet: message.data.tweet,
              author: gameManager.tweet.author,
              authorHandle: gameManager.tweet.authorHandle,
              authorChoices: message.data.authorChoices,
            },
          }));
          break;
        case "startFinish":
          setGameManager((gameManager) => ({
            ...gameManager,
            state: message.data.state,
            tweet: {
              tweet: gameManager.tweet.tweet,
              author: message.data.author,
              authorHandle: message.data.authorHandle,
              authorChoices: gameManager.tweet.authorChoices,
            },
          }));
          break;
      }
    };

    return () => soc.close();
  }, []);

  return [gameManager, performAction];
}
