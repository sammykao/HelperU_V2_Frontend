import { ClientProfileData, HelperProfileData } from "@/lib/api/profile"
import type { NavSidebarRoute } from "@/lib/utils/types";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "./ui/tooltip";
// import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useNavbar } from "@/lib/contexts/NavSidebarContext";

type Profile = HelperProfileData | ClientProfileData;

type MobileNavSidebarProps = {
  navigationItems: NavSidebarRoute[],
  profile: Profile;
  isLoading: boolean
}

export function MobileNavSidebar({ navigationItems, profile, isLoading }: MobileNavSidebarProps) {
  const { setPage } = useNavbar();

  return (
    <div className="fixed top-0 left-0 h-full w-16 bg-slate-100 z-10 border border-gray-200 py-4">
      <div className="flex flex-col justify-between h-full items-center">
        <div className="flex flex-col items-center justify-start gap-y-2 relative">
          <Button className="hover:cursor-pointer">
            <h1 className="text-2xl font-display font-extrabold bg-linear-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md">
              H
            </h1>
          </Button>
          <div className="border-b border-slate-700 w-full" />
          {navigationItems.map((nav) => (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="bg-slate-200 hover:bg-slate-300 transition-all duration-300 active:scale-80 hover:text-cyan-500 p-2 rounded-md"
                    onClick={() => setPage(nav.page)}
                  >
                    <nav.icon strokeWidth={1.5} />
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  className="z-10 transition-all duration-100 p-0 bg-transparent border-none shadow-none"
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
                      {nav.hoverText}
                    </div>

                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div>
          <div onClick={() => setPage("profile")} className="w-fit h-fit hover:cursor-pointer">
            {isLoading ? (
              <div className="size-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-xl text-white">👤</span>
              </div>
            ) : (
              profile.pfp_url ? (
                <img
                  src={profile.pfp_url}
                  alt="Profile"
                  className="size-10 rounded-full object-cover border-4 border-white shadow-md flex-1"
                />
              ) : (
                <div className="size-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-md">
                  <span className="text-xl text-white">👤</span>
                </div>
              )

            )}
          </div>

        </div>
      </div>
    </div>
  )
}
