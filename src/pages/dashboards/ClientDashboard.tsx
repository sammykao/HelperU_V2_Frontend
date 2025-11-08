import { useState } from 'react';
import { ClientProfileData } from '@/lib/api/profile';
import { NavSideBar } from '@/components/NavSideBar';
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';
import { Briefcase, PenLine, Search, User } from "lucide-react";
import { ClientPage, NavSidebarRoute } from '@/lib/utils/types';
import Profile from '../auth/Profile';
import MyPosts from '../tasks/MyPosts';
import SearchHelpers from '../helpers/SearchHelpers';
import CreateTask from '../tasks/CreateTask';

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
  const { open } = useSidebar();

  return (
    <div className="flex h-full w-full relative">
      {/* Sidebar stays fixed */}
      <NavSideBar
        setPage={setPage}
        navigationItems={routes}
        profile={profile}
        isLoading={isLoading}
      />

      {/* Trigger fixed at top, moves with sidebar */}
      <SidebarTrigger
        className={cn(
          "fixed top-2 transition-all duration-300 ease-in-out z-9999 rounded-md p-2 bg-white shadow-sm hover:bg-slate-100",
          open ? "left-80" : "left-2"
        )}
      />

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 p-6 transition-all duration-300 ease-in-out h-full w-full",
          open ? "translate-x-40" : "translate-x-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default ClientDashboard;
