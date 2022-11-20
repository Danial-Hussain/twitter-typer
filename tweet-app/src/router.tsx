import Home from "./Home";
import Game from "./Game";
import Keyboards from "./Keyboards";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/keyboards",
    element: <Keyboards />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
]);

export default router;
