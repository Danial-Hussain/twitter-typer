export const client = import.meta.env.DEV
  ? "http://localhost:5173"
  : "https://twittertyper.tech";

export const server = import.meta.env.DEV
  ? "http://localhost:8080"
  : "https://server.twittertyper.tech";

export const socket = import.meta.env.DEV
  ? "ws://localhost:8080/ws"
  : "wss://server.twittertyper.tech/ws";

export const gapi_client =
  "136033440281-oa9fambuee7l3tmfb5an2mnlf3mhkm2j.apps.googleusercontent.com";
