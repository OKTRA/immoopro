import { ReactNode } from "react";
import { useParams, Navigate, Outlet } from "react-router-dom";
import AgencySidebar from "./AgencySidebar";
import AgencyHeader from "./AgencyHeader";

function AgencyLayout() {
  const { agencyId } = useParams();

  // Redirect to home if no agencyId
  if (!agencyId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AgencySidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AgencyHeader />

        {/* Content - using Outlet for nested routes */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgencyLayout;
