import { Calendar, Star } from "lucide-react"

export default function RightLandingCard() {
  const profile = {
    name: "Sammy Kao",
    pfp_url: "https://www.shutterstock.com/image-photo/portrait-happy-asian-man-blue-600w-1922514041.jpg",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer laoreet a ex non ultrices. Duis dictum ut tortor vel cursus."
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-1">
      {/* Banner */}
      <div className="h-24 lg:h-40 bg-linear-to-r from-teal-300 via-cyan-400 to-blue-400 w-full rounded-2xl" />

      {/* Profile Picture */}
      <div className="relative w-full">
        <div className="absolute right-1/2 translate-x-[90%] md:translate-x-[76%] lg:translate-x-[90%] -translate-y-12 lg:-translate-y-24">
          <img
            src={profile.pfp_url}
            alt={profile.name}
            className="size-16 lg:size-32 rounded-full border-4 border-white shadow-md"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="relative w-full flex justify-center">
        <div className="flex flex-col items-center justify-between mt-4 lg:mt-10 w-[80%] min-h-[300px] gap-y-2">
          {/* Top Section */}
          <div className="flex flex-col items-center relative">
            <div className="tracking-tight font-bold text-center text-base lg:text-xl absolute translate-y-1 translate-x-[26px] lg:translate-x-[50px]">
              {profile.name}
            </div>

            <div className="flex flex-col md:flex-row gap-x-1 items-center justify-center tracking-tight text-xs sm:text-sm md:text-base mt-1 absolute translate-y-8 translate-x-[26px] lg:translate-x-[50px]">
              <Calendar className="size-4 font-bold" /> Joined August 2025
            </div>

            <div className="flex flex-row justify-center items-center gap-x-1 md:gap-x-2 mt-2 absolute translate-y-20 translate-x-[26px] lg:translate-x-[50px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            <div className="text-center mx-12 lg-mx-20 xl:mx-24 mt-4 text-[12px] sm:text-sm md:text-base translate-y-32 lg:translate-y-28 translate-x-[26px] lg:translate-x-[50px]">
              Trusted helper, happy to help!
            </div>
          </div>

          {/* Bottom Button */}
          <div className="bg-blue-500 text-white py-1 lg:py-2 text-center w-9/12 md:w-4/5 h-fit rounded-md text-xs sm:text-sm md:text-base mb-4 absolute translate-y-64 sm:translate-y-88 md:translate-y-[340px] lg:translate-y-[248px] translate-x-[26px] lg:translate-x-10 pl-6">
            Invite Helper
          </div>
        </div>
      </div>
    </div>
  )
}
