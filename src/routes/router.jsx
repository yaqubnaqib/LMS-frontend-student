import AppShell from "../layout/AppShell";
import ErrorPage, { NotFound, RouteError } from "../pages/Error";
import Home, { homeLoader } from "../pages/Home";
import Books, { booksLoader } from "../pages/Books";
import BookDetail, { bookAction, bookLoader } from "../pages/BookDetail";
import Login, { loginAction } from "../pages/Login";
import Signup, { signupAction } from "../pages/Signup";
import Bookings, { bookingsAction, bookingsLoader } from "../pages/Bookings";
import Profile, { profileLoader } from "../pages/Profile";
import { GuestOnly, RequireAuth } from "../auth/guards";

const routesConfig = [
  {
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <Home />, loader: homeLoader },
          { path: "books", element: <Books />, loader: booksLoader },
          { path: "books/:id", element: <BookDetail />, loader: bookLoader, action: bookAction },
          { path: "login", element: <GuestOnly><Login /></GuestOnly>, action: loginAction },
          { path: "signup", element: <GuestOnly><Signup /></GuestOnly>, action: signupAction },
          {
            path: "bookings",
            element: <RequireAuth><Bookings /></RequireAuth>,
            loader: bookingsLoader,
            action: bookingsAction,
          },
          { path: "profile", element: <RequireAuth><Profile /></RequireAuth>, loader: profileLoader },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
];

export default routesConfig;
