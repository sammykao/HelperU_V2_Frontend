import { useState } from "react";
import { AIChat } from "../../components/ai/AIChat";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { NavSideBar } from "@/components/NavSideBar";
import { Briefcase, ClipboardPenLine, User } from "lucide-react";
import { HelperProfileData } from "@/lib/api/profile";
import BrowseTasks from "../tasks/BrowseTasks";
import MyApplications from "@/pages/tasks/MyApplications";
import { cn } from "@/lib/utils";
import Profile from "../auth/Profile";
import { HelperPage } from "@/lib/utils/types";

type HelperDashboardProps = {
  profile: HelperProfileData;
  isLoading: boolean;
};

function HelperDashboard({ profile, isLoading }: HelperDashboardProps) {
  const [page, setPage] = useState<HelperPage>("tasks");

  const routes: any = [
    { title: "Job Board", page: "tasks", icon: Briefcase },
    { title: "Applications", page: "apps", icon: ClipboardPenLine },
    { title: "Edit Profile", page: "profile", icon: User },
  ];

  const renderComponent = () => {
    switch (page) {
      case "tasks":
        return <BrowseTasks />;
      case "apps":
        return <MyApplications />;
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
          "flex-1 transition-all duration-300 ease-in-out h-full w-full",
          open ? "translate-x-40" : "translate-x-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
