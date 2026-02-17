import { createBrowserRouter } from "react-router"
import App from "@/App"
import { AuthCallbackPage } from "@/pages/auth-callback-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { ProgressPage } from "@/pages/progress-page"
import { SettingsPage } from "@/pages/settings-page"
import { WorkoutPage } from "@/pages/workout-page"

export const router = createBrowserRouter([
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "workout",
        element: <WorkoutPage />,
      },
      {
        path: "progress",
        element: <ProgressPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
])
