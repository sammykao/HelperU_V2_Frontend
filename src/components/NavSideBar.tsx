import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { formatPhone, cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { ProfileCard } from "./ProfileCard"

import {
  SidebarHeader,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { ClientProfileData, HelperProfileData } from "@/lib/api/profile"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import type { NavSidebarRoute } from "@/lib/utils/types"
import collegesData from "@/data/colleges.json";
import { useNavbar } from "@/lib/contexts/NavSidebarContext"

type Profile = HelperProfileData | ClientProfileData;

type NavSideBarProps = {
  navigationItems: NavSidebarRoute[],
  profile: Profile;
  isLoading: boolean
}


export function NavSideBar({ navigationItems, profile, isLoading }: NavSideBarProps) {
  const { logout } = useAuth()
  const { setPage } = useNavbar();

  const navigate = useNavigate()
  const { open, setOpen, setOpenMobile, isMobile } = useSidebar()
  const prevInRange = useRef(false)
  const isMobileDevice = useIsMobile()

  const handleLogout = async () => {
    await logout();
    navigate('/');
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "transition-transform duration-300 ease-in-out z-50 w-[20rem] flex flex-col justify-between bg-slate-900 fixed left-0 top-0",
        // Only apply manual transforms on desktop (mobile uses Sheet component)
        !(isMobileDevice || isMobile) && (open ? "translate-x-0" : "-translate-x-full")
      )}
    >
      {/* Top Section — Profile */}
      <div className="shrink-0">
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupContent className="relative min-h-[220px]">
              {isLoading ? (
                <span>...fetching profile info</span>
              ) : (
                <ProfileCard profile={profile} />
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
      </div>

      {/* Middle Section — Navigation */}
      <div className="flex-1 overflow-y-auto mt-4">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="w-full">
                {navigationItems.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="active:scale-95 transition-all cursor-pointer"
                  >
                    <SidebarMenuButton asChild>
                      <div
                        className="flex items-center justify-start gap-x-2"
                        onClick={() => {
                          setPage(item.page);
                          // Close sidebar on mobile when clicking menu item
                          if (isMobileDevice || isMobile) {
                            setOpenMobile(false);
                          } else {
                            setOpen(false);
                          }
                        }}
                      >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>

      {/* Bottom Section — Footer */}
      <SidebarFooter className="shrink-0 mt-auto pb-4 px-4">
        <Button
          variant="destructive"
          className="w-full bg-black hover:bg-black/80 text-white active:scale-95 transition-all"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
