import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routesConfig from "./routes/router";

const router = createBrowserRouter(routesConfig);

export default function App() {
  return <RouterProvider router={router} />;
}
