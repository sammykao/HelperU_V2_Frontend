import { useState } from 'react';
import { ClientProfileData } from '@/lib/api/profile';
import { NavSideBar } from '@/components/NavSideBar';
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { Briefcase, PenLine, Search, User, Menu } from "lucide-react";
import { ClientPage, NavSidebarRoute } from '@/lib/utils/types';
import Profile from '../auth/Profile';
import MyPosts from '../tasks/MyPosts';
import SearchHelpers from '../helpers/SearchHelpers';
import CreateTask from '../tasks/CreateTask';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type ClientDashboardProps = {
  profile: ClientProfileData;
  isLoading: boolean;
};


function ClientDashboard({ profile, isLoading }: ClientDashboardProps) {
  const [page, setPage] = useState<ClientPage>("myPosts");

  const routes: NavSidebarRoute[] = [
    { title: "Create a Post", page: "createPost", icon: PenLine },
    { title: "My Posts", page: "myPosts", icon: Briefcase },
    { title: "Search Helpers", page: "searchHelpers", icon: Search },
    { title: "Edit Profile", page: "profile", icon: User },
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
        return <SearchHelpers setPage={setPage} />
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

export default ClientDashboard;
