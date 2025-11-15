import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClientProfileData } from '@/lib/api/profile';
import { NavSideBar } from '@/components/NavSideBar';
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { Briefcase, PenLine, Search, User, Menu, Map } from "lucide-react";
import { ClientPage, NavSidebarRoute } from '@/lib/utils/types';
import Profile from '../auth/Profile';
import MyPosts from '../tasks/MyPosts';
import SearchHelpers from '../helpers/SearchHelpers';
import MapView from '../helpers/MapView';
import CreateTask from '../tasks/CreateTask';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavSidebar } from '@/components/MobileNavSidebar';
import { useNavbar } from '@/lib/contexts/NavSidebarContext';

type ClientDashboardProps = {
  profile: ClientProfileData;
  isLoading: boolean;
};


function ClientDashboard({ profile, isLoading }: ClientDashboardProps) {
  const { page, setPage } = useNavbar()

  // Check if we need to switch page based on query string
  useEffect(() => {
    const pageParam = searchParams.get('page');
    
    if (pageParam === 'createPost') {
      setPage("createPost");
    } else if (pageParam === 'myPosts') {
      setPage("myPosts");
    } else if (pageParam === 'searchHelpers') {
      setPage("searchHelpers");
    } else if (pageParam === 'mapView') {
      setPage("mapView");
    } else if (pageParam === 'profile') {
      setPage("profile");
    }
  }, [searchParams]);

  const routes: NavSidebarRoute[] = [
    { title: "Create a Post", page: "createPost", icon: PenLine, hoverText: "Create A Post" },
    { title: "My Posts", page: "myPosts", icon: Briefcase, hoverText: "My Posts" },
    { title: "Search Helpers", page: "searchHelpers", icon: Search, hoverText: "Search Helpers" },
    { title: "Edit Profile", page: "profile", icon: User, hoverText: "Edit Profile" },
  ];

  const renderComponent = () => {
    switch (page) {
      case "createPost":
        // @ts-ignore
        return <CreateTask setPage={setPage} />
      case "myPosts":
        // @ts-ignore
        return <MyPosts setPage={setPage} />
      case "searchHelpers":
        // @ts-ignore
        return <SearchHelpers setPage={setPage} />
      case "mapView":
        return <MapView />
      case "profile":
        return <Profile />
      default:
        return null;
    }
  };

  return (<div className="min-h-screen h-full w-full bg-linear-to-b from-white via-blue-50 to-blue-100 overflow-x-hidden">
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
  </div>)
}

function DashboardLayout({ children, setPage, routes, profile, isLoading }: any) {
  const { open, isMobile, toggleSidebar } = useSidebar();
  const isMobileDevice = useIsMobile();

  return (
    <div className="flex h-full w-full relative">
      {/* render out diff navbar based on mobile vs desktop */}
      {isMobileDevice ? (
        <MobileNavSidebar
          setPage={setPage}
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
            setPage={setPage}
            navigationItems={routes}
            profile={profile}
            isLoading={isLoading}
          />
        </>
      )}


      {/* Main content area */}
      <main
        className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out h-full",

          !(isMobileDevice || isMobile) &&
          (open
            ? "md:ml-72 md:w-[calc(100vw-18rem)]"
            : "ml-0 w-full"),

          isMobileDevice && "pl-20 w-[calc(100%-5rem)]"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default ClientDashboard;
