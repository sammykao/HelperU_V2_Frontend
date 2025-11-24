import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProfileCard } from "./ProfileCard";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "./ui/Tooltip";

import {
  Sidebar,
  SidebarContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { ClientProfileData, HelperProfileData } from "@/lib/api/profile"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import type { NavSidebarRoute } from "@/lib/utils/types"
import { useNavbar } from "@/lib/contexts/NavSidebarContext"
import { PanelLeft, PanelRight } from "lucide-react"

type Profile = HelperProfileData | ClientProfileData;

type NavSideBarProps = {
  navigationItems: NavSidebarRoute[],
  profile: Profile;
  isLoading: boolean
}

export function NavSideBar({ navigationItems, profile }: NavSideBarProps) {
  const [logoHover, setLogoHover] = useState<boolean>(false);
  const { logout } = useAuth()
  const { setPage } = useNavbar();

  const navigate = useNavigate()
  const { open, setOpen, setOpenMobile, isMobile, toggleSidebar } = useSidebar()
  const isMobileDevice = useIsMobile()

  const handleLogout = async () => {
    await logout();
    navigate('/');
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(open ? "w-[20rem]" : "w-16", "transition-transform duration-300 border-r border-gray-200 shadow-lg py-2 px-4 bg-slate-100")}
      onMouseEnter={() => setLogoHover(true)}
      onMouseLeave={() => setLogoHover(false)}
    >

      <SidebarContent className={cn("bg-slate-100 flex flex-col justify-start py-0", open ? "items-start" : "items-center")}>
        <div className="flex flex-row items-center justify-between w-full">
          {logoHover && !open ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Button className="hover:bg-slate-200 w-full" onClick={toggleSidebar}>
                    <PanelLeft className="w-full" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent
                  className="z-10000 transition-all duration-100 p-0 bg-transparent border-none shadow-none"
                  side="right"
                  align="center"
                  sideOffset={6}
                >
                  <div className="flex flex-row items-center w-fit">
                    {/* Triangle */}
                    <div
                      className="
                        w-0 h-0
                        border-t-12 border-b-12 border-r-12
                        border-t-transparent border-b-transparent
                        border-r-black
                      "
                    />

                    {/* Text bubble */}
                    <div className="w-fit text-nowrap py-1 pr-2 bg-black font-bold text-white rounded-r-md">
                      Open Sidebar
                    </div>

                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <h1
              className={cn("text-2xl font-display font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md", open ? "mx-3" : "mx-2")}
            >
              {open ? "HelperU" : "H"}
            </h1>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-fit">
                <Button className="hover:bg-slate-200" onClick={toggleSidebar}>
                  <PanelRight />
                </Button>
              </TooltipTrigger>

              <TooltipContent
                className="transition-all duration-100 p-0 bg-transparent border-none shadow-none"
                side="right"
                align="center"
                sideOffset={6}
              >
                <div className="flex flex-row items-center w-fit z-10000">
                  {/* Triangle */}
                  <div
                    className="
                        w-0 h-0
                        border-t-12 border-b-12 border-r-12
                        border-t-transparent border-b-transparent
                        border-r-black
                      "
                  />

                  {/* Text bubble */}
                  <div className="w-fit text-nowrap py-1 pr-2 bg-black font-bold text-white rounded-r-md">
                    Close Sidebar
                  </div>

                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {navigationItems.map((item) => (
          <SidebarMenuItem
            key={item.title}
            className={cn("active:scale-95 transition-all cursor-pointer w-full flex flex-col justify-center")}
          >
            <SidebarMenuButton asChild>
              <Button
                className={cn("flex w-full hover:bg-slate-200 items-center rounded-lg", open ? "justify-start" : "justify-center")}
                onClick={() => {
                  setPage(item.page);
                  if (isMobileDevice || isMobile) {
                    setOpenMobile(false);
                  } else {
                    setOpen(false);
                  }
                }}
              >
                {!open ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="w-full rounded-md">
                        <item.icon />
                      </TooltipTrigger>

                      <TooltipContent
                        className="z-10 transition-all duration-100 p-0 bg-transparent border-none shadow-none ml-2"
                        side="right"
                        align="center"
                        sideOffset={6}
                      >
                        <div className="flex flex-row items-center w-fit">
                          {/* Triangle */}
                          <div
                            className="
                              w-0 h-0
                              border-t-12 border-b-12 border-r-12
                              border-t-transparent border-b-transparent
                              border-r-black
                            "
                          />

                          {/* Text bubble */}
                          <div className="w-fit text-nowrap py-1 pr-2 bg-black font-bold text-white rounded-r-md">
                            {item.hoverText}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <>
                    <item.icon />
                    <span>{item.title}</span>
                  </>
                )}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-slate-100 flex items-center justify-center p-0">
        {open ? (
          <div className="flex flex-col gap-y-2 justify-center items-center w-full">

            <ProfileCard profile={profile} />
            <Button
              variant="destructive"
              className="w-full bg-black hover:bg-black/80 text-white active:scale-95 transition-all"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full rounded-md">
                {profile && profile.pfp_url ? (
                  <img
                    src={profile.pfp_url}
                    alt="Profile"
                    className="rounded-md object-cover shadow-md w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-md bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-lg text-white">👤</span>
                  </div>
                )}
              </TooltipTrigger>

              <TooltipContent
                className="z-10 transition-all duration-100 p-0 bg-transparent border-none shadow-none ml-2"
                side="right"
                align="center"
                sideOffset={6}
              >
                <div className="flex flex-row items-center w-fit">
                  {/* Triangle */}
                  <div
                    className="
                              w-0 h-0
                              border-t-12 border-b-12 border-r-12
                              border-t-transparent border-b-transparent
                              border-r-black
                            "
                  />
                  {/* Text bubble */}
                  <div className="w-fit text-nowrap py-1 pr-2 bg-black font-bold text-white rounded-r-md">
                    Your Profile
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        )}
      </SidebarFooter>
    </Sidebar >
  )
}
