import Home from "./Home";
import Game from "./Game";
import Error from "./Error";
import Keyboards from "./Keyboards";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />,
  },
  {
    path: "/keyboards",
    element: <Keyboards />,
    errorElement: <Error />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
    errorElement: <Error />,
  },
]);

export default router;
