import { formatPhone } from "@/lib/utils"

export default function CenterCard() {
  const url = "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1760"

  return (
    <div className="w-full h-full flex flex-col items-start justify-between p-1 gap-y-2">
      <div className="h-48 bg-linear-to-bl from-fuchsia-500 via-pink-400 to-purple-600 w-full rounded-2xl flex flex-row justify-between items-center px-2 py-2">
        <div className="bg-white rounded-full p-1">
          <img src={url} className="size-16 md:size-32 rounded-full shrink-0" />
        </div>
        <div className="text-white lg:mr-3 text-left tracking-tight space-y-2 text-xs">
          <div className="space-y-2"><span className="font-bold">Client Name</span>: John Doe</div>
          <div className="space-y-2"><span className="font-bold">Email</span>: {formatPhone("15555555555")}</div>
          <div className="space-y-2"><span className="font-bold">Phone</span>: john@doe.com</div>
        </div>
      </div>
      <div className="w-full h-full flex flex-col items-start justify-center gap-y-2  rounded-md px-2 py-4">
        <span className="tracking-tight font-bold text-lg lg:text-3xl">Social Media Manager</span>
        <span className="whitespace-pre-wrap text-left tracking-tight text-xs sm:text-sm lg:text-base">
          <strong>Description</strong>: "Looking for a savvy social media user that is interested in managing my pets' social media profiles, will provide snacks/food."
        </span>
        <span className="tracking-tight text-xs sm:text-sm md:text-base">
          <strong>Hourly Rate</strong>:{" "}<span className="text-emerald-500 font-bold">$35/hr</span>
        </span>
        <span className="tracking-tight text-left text-xs sm:text-sm md:text-base">
          <strong>Special Tools</strong>: A love of pets and social media know how
        </span>
        <span className="tracking-tight text-left text-xs sm:text-sm md:text-base">
          <strong>Transportation</strong>: Train accessible from any station
        </span>
      </div>
      <div className="w-full h-fit bg-linear-to-br text-white from-fuchsia-500 via-pink-400 to-purple-600 rounded-md py-1 lg:py-2 mb-1 text-center">Find Helpers</div>
    </div>
  )
}

