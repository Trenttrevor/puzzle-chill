import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait until Clerk is fully finished reading the cookie/token handshake
  if (!isLoaded) return null;

  // If the sync is done and they aren't logged in, send them home
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // If they are signed in, let them view the puzzle page!
  return <Outlet />;
}
