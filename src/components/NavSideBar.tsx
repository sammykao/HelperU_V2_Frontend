import { Dispatch, SetStateAction } from "react"
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

type NavSideBarProps = {
  setPage: Dispatch<SetStateAction<Page>>,
  navigationItems: NavSidebarRoute[],
  profile: HelperProfileData | ClientProfileData;
  isLoading: boolean
}
// {(profile as HelperProfileData).zip_code && (
//                  <div className="flex items-center w-full">
//                    <span className="w-18 text-md tracking-tight">Zipcode:</span>
//                    <div className="px-2 py-1 rounded-md flex-1 text-right">
//                      {/* @ts-ignore */}
//                      {(profile as HelperProfileData).zip_code}
//                    </div>
//                  </div>
//                )}
//
// {(profile as HelperProfileData).graduation_year && (
//   <div className="flex items-center w-full">
//     <span className="w-18 text-md tracking-tight">Grad. Year:</span>
//     <div className="px-2 py-1 rounded-md flex-1 text-right">
//       {/* @ts-ignore */}
//       {(profile as HelperProfileData).graduation_year}
//     </div>
//   </div>
// )}
//
export function NavSideBar({ setPage, navigationItems, profile, isLoading }: NavSideBarProps) {
  const { open, setOpen } = useSidebar();
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout();
    navigate('/');
  }

  return (
    <Sidebar
      side="left"
      variant="floating"
      collapsible="offcanvas"
      className={`
        transition-transform duration-300 ease-in-out z-10 w-[20rem]
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel className="-ml-2">Your Profile</SidebarGroupLabel>
          <SidebarGroupContent className="">
            {isLoading ? (
              <span>...fetching profile info</span>
            ) : (
              <div className="flex flex-col flex-1 justify-center items-start gap-y-2">
                <div className="bg-linear-to-r from-blue-500 to-purple-600 w-full flex flex-col items-centre justify-center py-4 rounded-lg h-full gap-y-4">
                  <div className="relative flex items-center justify-center w-full ">
                    {profile.pfp_url ? (
                      <img
                        src={profile.pfp_url}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md">
                        <span className="text-4xl text-white">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full flex justify-center items-center mb-2 text-white font-bold text-xl">{profile.first_name} {profile.last_name}</div>
                </div>

                <div className="space-y-2 w-full mt-2">

                  <div className="flex items-center w-full">
                    <span className="w-18 text-md tracking-tight">Email:</span>
                    <div className="px-2 py-1 rounded-md flex-1 text-right overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
                      {profile.email}
                    </div>
                  </div>

                  <div className="flex items-center w-full">
                    <span className="w-18 text-md tracking-tight">Phone:</span>
                    <div className=" px-2 py-1 rounded-md flex-1 text-right">
                      {formatPhone(profile.phone as string)}
                    </div>
                  </div>

                  {(profile as HelperProfileData).college && (
                    <div className="flex items-center w-full">
                      <span className="w-18 text-md tracking-tight">School:</span>
                      <div className="px-2 py-1 rounded-md flex-1 text-right">
                        {/* @ts-ignore */}
                        {Object.keys(collegesData).find(key => collegesData[key] === (profile as HelperProfileData).college) || "School Not Found"}
                      </div>
                    </div>
                  )}




                  {(profile as HelperProfileData).number_of_applications !== undefined && (
                    <div className="flex items-center w-full">
                      <span className="w-fit text-md tracking-tight">Apps Submitted:</span>
                      <div className="px-2 py-1 rounded-md flex-1 text-right">
                        {/* @ts-ignore */}
                        {(profile as HelperProfileData).number_of_applications}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="w-full ">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title} className="active:scale-95 transition-all cursor-pointer">
                  <SidebarMenuButton asChild>
                    <div className="flex items-center justify-start" onClick={() => { setPage(item.page); setOpen(false); }}>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button variant={"destructive"} className="transition-all active:scale-95 w-full bg-black hover:bg-black/80 text-white" onClick={handleLogout}>Logout</Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
