import type { HelperProfileData, ClientProfileData } from "@/lib/api/profile";
import { formatPhone } from "@/lib/utils";
import collegesData from "@/data/colleges.json"

type Profile = HelperProfileData | ClientProfileData;
type ProfileCardProps = {
  profile: Profile
}


function ProfileBackDrop() {
  return <svg className="w-fit h-fit rounded-md" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'><rect fill='#ff7700' width='1600' height='900' /><polygon fill='#cc0000' points='957 450 539 900 1396 900' /><polygon fill='#aa0000' points='957 450 872.9 900 1396 900' /><polygon fill='#d6002b' points='-60 900 398 662 816 900' /><polygon fill='#b10022' points='337 900 398 662 816 900' /><polygon fill='#d9004b' points='1203 546 1552 900 876 900' /><polygon fill='#b2003d' points='1203 546 1552 900 1162 900' /><polygon fill='#d3006c' points='641 695 886 900 367 900' /><polygon fill='#ac0057' points='587 900 641 695 886 900' /><polygon fill='#c4008c' points='1710 900 1401 632 1096 900' /><polygon fill='#9e0071' points='1710 900 1401 632 1365 900' /><polygon fill='#aa00aa' points='1210 900 971 687 725 900' /><polygon fill='#880088' points='943 900 1210 900 971 687' /></svg>
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="w-full rounded-xl p-2 shadow-lg">
      <div className="h-fit rounded-xl relative">
        <ProfileBackDrop />

        <div className="absolute top-22 left-6">
          {profile.pfp_url ? (
            <img
              src={profile.pfp_url}
              alt="Profile"
              className="size-24 rounded-full object-cover border-4 border-white shadow-md flex-1"
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
                {(() => {
                  const collegeValue = (profile as HelperProfileData).college;
                  if (!collegeValue) return "Not Set";

                  // First check if it's already a college name (key in collegesData)
                  if (collegesData[collegeValue as keyof typeof collegesData]) {
                    return collegeValue;
                  }

                  // Otherwise, try to find the college name by matching the domain (value)
                  const collegeName = Object.keys(collegesData).find(
                    key => collegesData[key as keyof typeof collegesData] === collegeValue
                  );

                  return collegeName || collegeValue || "Not Set";
                })()}
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
