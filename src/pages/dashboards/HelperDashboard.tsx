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
import { HelperPage } from "@/lib/utils/types";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

type HelperDashboardProps = {
  profile: HelperProfileData;
  isLoading: boolean;
};

function HelperDashboard({ profile, isLoading }: HelperDashboardProps) {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState<HelperPage>("tasks");

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
    { title: "Job Board", page: "tasks", icon: Briefcase },
    { title: "Applications", page: "apps", icon: ClipboardPenLine },
    { title: "Map View", page: "mapView", icon: Map },
    { title: "Leaderboard", page: "leaderboard", icon: Trophy },
    { title: "Edit Profile", page: "profile", icon: User },
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
      <SidebarProvider style={{ "--sidebar-width": "20rem" }} defaultOpen={false} className="w-full h-full flex flex-1 items-center justify-center">
        <DashboardLayout
          setPage={setPage}
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

function DashboardLayout({ children, setPage, routes, profile, isLoading }: any) {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const isMobileDevice = useIsMobile();

  return (
    <div className="flex h-full w-full relative">
      {/* Sidebar stays fixed */}
      <NavSideBar
        setPage={setPage}
        navigationItems={routes}
        profile={profile}
        isLoading={isLoading}
      />

      {/* Mobile Sidebar Trigger Button - Floating */}
      {(isMobileDevice || isMobile) && !openMobile && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white md:hidden"
          size="icon"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Desktop Sidebar Trigger - Top Left */}
      {!(isMobileDevice || isMobile) && !open && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 h-10 w-10 rounded-lg shadow-md bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 md:flex hidden items-center justify-center"
          size="icon"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out h-full w-full",
          // Only translate on desktop when sidebar is open
          !(isMobileDevice || isMobile) && open ? "md:translate-x-40" : "translate-x-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
