import { useRef, useEffect, Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { formatPhone } from "@/lib/utils"

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
import type { NavSidebarRoute, Page } from "@/lib/utils/types"
import collegesData from "@/data/colleges.json";

type Profile = HelperProfileData | ClientProfileData;

type NavSideBarProps = {
  setPage: Dispatch<SetStateAction<Page>>,
  navigationItems: NavSidebarRoute[],
  profile: Profile;
  isLoading: boolean
}


export function NavSideBar({ setPage, navigationItems, profile, isLoading }: NavSideBarProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { open, setOpen } = useSidebar()
  const prevInRange = useRef(false)

  const handleLogout = async () => {
    await logout();
    navigate('/');
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const x = e.clientX
      const lowerBound = 1 * rem
      const upperBound = 20 * rem

      const inRange = x >= lowerBound && x <= upperBound

      // only open if the mouse ENTERED the range (was out before, now in)
      if (inRange && !prevInRange.current && !open) {
        setOpen(true)
      }

      // close only if the mouse leaves the range entirely
      if (!inRange && open) {
        setOpen(false)
      }

      // update previous state
      prevInRange.current = inRange
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [open])

  return (
    <Sidebar
      side="left"
      variant="floating"
      collapsible="offcanvas"
      className={`
    transition-transform duration-300 ease-in-out z-10 w-[20rem] flex flex-col justify-between
    ${open ? "translate-x-0" : "-translate-x-full"}
  `}
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
                          setOpen(false);
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

function ProfileBackDrop() {
  return <svg className="w-fit h-fit rounded-md" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'><rect fill='#ff7700' width='1600' height='900' /><polygon fill='#cc0000' points='957 450 539 900 1396 900' /><polygon fill='#aa0000' points='957 450 872.9 900 1396 900' /><polygon fill='#d6002b' points='-60 900 398 662 816 900' /><polygon fill='#b10022' points='337 900 398 662 816 900' /><polygon fill='#d9004b' points='1203 546 1552 900 876 900' /><polygon fill='#b2003d' points='1203 546 1552 900 1162 900' /><polygon fill='#d3006c' points='641 695 886 900 367 900' /><polygon fill='#ac0057' points='587 900 641 695 886 900' /><polygon fill='#c4008c' points='1710 900 1401 632 1096 900' /><polygon fill='#9e0071' points='1710 900 1401 632 1365 900' /><polygon fill='#aa00aa' points='1210 900 971 687 725 900' /><polygon fill='#880088' points='943 900 1210 900 971 687' /></svg>
}

type ProfileCardProps = {
  profile: Profile
}

function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="w-full rounded-xl p-1">
      <div className="h-fit rounded-xl relative">
        <ProfileBackDrop />

        <div className="absolute top-22 left-6">
          {profile.pfp_url ? (
            <img
              src={profile.pfp_url}
              alt="Profile"
              className="size-16 rounded-full object-cover border-4 border-white shadow-md flex-1"
            />
          ) : (
            <div className="size-24 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md flex-1">
              <span className="text-4xl text-white">👤</span>
            </div>
          )}

        </div>

        <div
          style={{ scrollbarWidth: "none" }}
          className="whitespace-nowrap mt-10 mx-2 flex justify-start items-center mb-2 text-black font-semibold text-xl tracking-tight overflow-x-auto"
        >
          {profile.first_name} {profile.last_name}
        </div>
        <div className="w-full mt-2 mx-2">

          <div className="flex items-center w-full">
            <span className="w-18 text-md tracking-tight">Email:</span>
            <div className="px-2 py-1 mr-2 rounded-md flex-1 text-right overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {profile.email}
            </div>
          </div>

          <div className="flex items-center w-full">
            <span className="w-18 text-md tracking-tight">Phone:</span>
            <div className=" px-2 py-1 rounded-md flex-1 text-right mr-2">
              {formatPhone(profile.phone as string)}
            </div>
          </div>

          {(profile as ClientProfileData).number_of_posts !== undefined && (
            <div className="flex items-center w-full">
              <span className="w-full text-md tracking-tight">Num Posts:</span>
              <div className="px-2 py-1 rounded-md flex-1 text-right mr-2">
                {/* @ts-ignore */}
                {(profile as ClientProfileData).number_of_posts}
              </div>
            </div>
          )}

          {(profile as HelperProfileData).college && (
            <div className="flex items-center w-full">
              <span className="w-18 text-md tracking-tight">School:</span>
              <div className="px-2 py-1 rounded-md flex-1 text-right mr-2">
                {/* @ts-ignore */}
                {Object.keys(collegesData).find(key => collegesData[key] === (profile as HelperProfileData).college) || "School Not Found"}
              </div>
            </div>
          )}

          {(profile as HelperProfileData).number_of_applications !== undefined && (
            <div className="flex items-center w-full">
              <span className="w-fit text-md tracking-tight">Apps Submitted:</span>
              <div className="px-2 py-1 rounded-md flex-1 text-right mr-2">
                {/* @ts-ignore */}
                {(profile as HelperProfileData).number_of_applications}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
