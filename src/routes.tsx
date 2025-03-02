
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IndexPage from "@/pages/Index";
import NotFoundPage from "@/pages/NotFound";
import AuthPage from "@/pages/Auth";
import ProfilePage from "@/pages/Profile";
import DatabaseStatusPage from "@/pages/DatabaseStatus";
import { useUser } from "@/contexts/UserContext";
import { Dashboard } from "@/components/Dashboard";

export const AppRoutes = () => {
  const { user, profile, isLoading } = useUser();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <IndexPage />,
    },
    {
      path: "/auth",
      element: <AuthPage />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    {
      path: "/dashboard",
      element: <Dashboard user={user} />,
    },
    {
      path: "/database-status",
      element: <DatabaseStatusPage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <RouterProvider router={router} />;
};
