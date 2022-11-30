export const client =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://twittertyper.tech";

export const server =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://server.twittertyper.tech";

export const socket =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:8080/ws"
    : "ws://twittertyper.tech/ws";

export const gapi_client =
  "136033440281-oa9fambuee7l3tmfb5an2mnlf3mhkm2j.apps.googleusercontent.com";
