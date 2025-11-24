import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
// import { NavSideBar } from "@/components/NavSideBar";
import { NavSideBar } from "@/components/NavSideBar_v2";
import { Briefcase, ClipboardPenLine, User, Menu, Map, Trophy, PanelLeft, MapPin, ChartColumn } from "lucide-react";
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
    // { title: "Map View", page: "mapView", icon: MapPin, hoverText: "Map View" },
    // { title: "Leaderboard", page: "leaderboard", icon: ChartColumn, hoverText: "Leaderboard" },
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
        <SidebarInset>
          <DashboardLayout
            routes={routes}
            profile={profile}
            isLoading={isLoading}
          >
            {renderComponent()}
          </DashboardLayout>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default HelperDashboard;

function DashboardLayout({ children, routes, profile, isLoading }: any) {
  const { open, isMobile } = useSidebar();
  const isMobileDevice = useIsMobile();

  return (
    <div className={cn("flex h-full w-full relative mx-0 px-0")}>

      {/* render out diff navbar based on mobile vs desktop */}
      {isMobileDevice ? (
        <MobileNavSidebar
          navigationItems={routes}
          profile={profile}
          isLoading={isLoading}
        />
      ) : (
        <NavSideBar
          navigationItems={routes}
          profile={profile}
          isLoading={isLoading}
        />
      )}

      <main
        className={cn(
          "transition-all duration-300 ease-in-out h-full",

          !(isMobileDevice || isMobile) &&
          (open
            ? "md:ml-80 md:w-[calc(100vw-20rem)]"
            : "ml-12 w-[calc(100vw-2.5rem)]"),

          isMobileDevice && "pl-20 w-[calc(100%-4px)]"
        )}
      >
        {/* Main content area */}
        {children}
      </main>
    </div >
  );
}
