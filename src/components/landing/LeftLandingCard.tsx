import { Calendar, Star } from "lucide-react"

export default function LeftLandingCard() {
  const profile = {
    name: "Josh Bernstein",
    pfp_url: "https://www.shutterstock.com/image-photo/portrait-happy-asian-man-blue-600w-1922514041.jpg",
    bio: "Hardworking helper, that's happy to help out!"
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-1">
      {/* Banner */}
      <div className="h-40 bg-linear-to-r from-blue-400 via-cyan-400 to-teal-300 w-full rounded-2xl" />

      {/* Profile Picture */}
      <div className="relative w-full">
        <div className="absolute left-1/2 -translate-x-3/4 -translate-y-24">
          <img
            src={profile.pfp_url}
            alt={profile.name}
            className="size-32 rounded-full border-4 border-white shadow-md"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative w-full">
        <div className="absolute left-1/2 -translate-x-3/5 w-full">
          <div className="flex flex-col items-center justify-center mt-10 w-full h-full gap-y-2">
            <div className="tracking-tight text-xl font-bold text-center">{profile.name}</div>
            <div className="flex flex-row gap-x-1 items-center justify-center tracking-tight">
              <Calendar className="size-4 font-bold" /> Joined August 2025
            </div>

            <div className="flex flex-row justify-center items-center gap-x-2 h-fit w-fit">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            <div className="text-center mx-28 mt-4 mb-8">Trusted helper, happy to help out clients</div>

            <div className="bg-blue-500 text-white py-2 text-center w-4/5 translate-x-3 h-fit rounded-md ">Invite Helper</div>
          </div>
        </div>
      </div>

    </div>
  )
}
