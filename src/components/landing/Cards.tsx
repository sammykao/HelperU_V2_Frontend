import LeftLandingCard from "./LeftLandingCard"
import { cn } from "@/lib/utils";
import RightLandingCard from "./RightLandingCard";
import CenterCard from "./CenterCard";

// {/* Left Card */}
// <div className={cn("absolute rounded-2xl bg-white/80 z-0 shadow-lg", cardSize, leftShiftFactor)}>
//   <LeftLandingCard />
// </div>

export default function Cards() {
  const cardSize = "w-[350px] sm:w-[400px] md:w-[450px] h-[350px] sm:h-[450px]";
  const leftShiftFactor = "-translate-x-[55%] sm:-translate-x-[70%]"
  const rightShiftFactor = "translate-x-[55%] sm:translate-x-[70%]"

  const centerCardSize = "w-[350px] sm:w-[250px] md:w-[450px] h-[350px] sm:h-[520px]"

  return (
    <div className="relative flex justify-center items-end w-full max-w-4xl h-[550px]">
      {/* Center Card */}
      <div className={cn("absolute rounded-2xl p-0.5 bg-white z-10 shadow-2xl", centerCardSize)}>
        <CenterCard />
      </div>

      {/* Right Card */}
      <div className={cn("absolute rounded-2xl bg-white/80 z-0  shadow-lg", cardSize, rightShiftFactor)}>
        <RightLandingCard />
      </div>
    </div>
  )
}

