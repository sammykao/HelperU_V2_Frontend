import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { NavSideBar } from "@/components/NavSideBar";
import { Briefcase, ClipboardPenLine, User, Menu, Map, Trophy } from "lucide-react";
import { HelperProfileData } from "@/lib/api/profile";
import BrowseTasks from "../tasks/BrowseTasks";
import MyApplications from "@/pages/tasks/MyApplications";
import HelperMapView from "../helpers/HelperMapView";
import Leaderboard from "../helpers/Leaderboard";
import { cn } from "@/lib/utils";
import Profile from "../auth/Profile";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNavSidebar } from "@/components/MobileNavSidebar";
import { useNavbar } from "@/lib/contexts/NavSidebarContext";

type HelperDashboardProps = {
  profile: HelperProfileData;
  isLoading: boolean;
};

function HelperDashboard({ profile, isLoading }: HelperDashboardProps) {
  const [searchParams] = useSearchParams();
  const { page, setPage } = useNavbar()

  // Check if we need to switch page based on query string
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    const pageParam = searchParams.get('page');

    if (taskId) {
      setPage("tasks");
    } else if (pageParam === 'tasks') {
      setPage("tasks");
    } else if (pageParam === 'mapView') {
      setPage("mapView");
    } else if (pageParam === 'leaderboard') {
      setPage("leaderboard");
    } else if (pageParam === 'apps') {
      setPage("apps");
    } else if (pageParam === 'profile') {
      setPage("profile");
    }
  }, [searchParams]);

  const routes: any = [
    { title: "Job Board", page: "tasks", icon: Briefcase, hoverText: "Job Board" },
    { title: "Applications", page: "apps", icon: ClipboardPenLine, hoverText: "Your Applications" },
    { title: "Edit Profile", page: "profile", icon: User, hoverText: "Edit Profile" },
  ];

  const renderComponent = () => {
    switch (page) {
      case "tasks":
        return <BrowseTasks />;
      case "apps":
        return <MyApplications />;
      case "mapView":
        return <HelperMapView />;
      case "leaderboard":
        return <Leaderboard />;
      case "profile":
        return <Profile />
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-linear-to-b from-white via-blue-50 to-blue-100 overflow-x-hidden">

      {/* @ts-ignore */}
      <SidebarProvider style={{ "--sidebar-width": "20rem" }} defaultOpen={false} className={cn("w-full h-full flex flex-1 items-center justify-center")}>
        <DashboardLayout
          routes={routes}
          profile={profile}
          isLoading={isLoading}
        >
          {renderComponent()}
        </DashboardLayout>
      </SidebarProvider>
    </div>
  );
}

export default HelperDashboard;

function DashboardLayout({ children, routes, profile, isLoading }: any) {
  const { open, isMobile, toggleSidebar } = useSidebar();
  const isMobileDevice = useIsMobile();

  return (
    <div className={cn("flex h-full w-full relative")}>

      {/* render out diff navbar based on mobile vs desktop */}
      {isMobileDevice ? (
        <MobileNavSidebar
          navigationItems={routes}
          profile={profile}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Desktop Sidebar Trigger - Top Left */}
          {!open && (
            <Button
              onClick={toggleSidebar}
              className="fixed top-4 left-4 z-50 h-10 w-10 rounded-lg shadow-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 md:flex hidden items-center justify-center"
              size="icon"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <NavSideBar
            navigationItems={routes}
            profile={profile}
            isLoading={isLoading}
          />
        </>
      )}

      <main
        className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out h-full",

          !(isMobileDevice || isMobile) &&
          (open
            ? "md:ml-80 md:w-[calc(100vw-18rem)]"
            : "ml-0 w-full"),

          isMobileDevice && "pl-20 w-[calc(100%-5rem)]"
        )}
      >
        {/* Main content area */}
        {children}
      </main>
    </div>
  );
}


