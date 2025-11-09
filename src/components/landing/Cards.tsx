import { cn } from "@/lib/utils";
import RightLandingCard from "./RightLandingCard";
import CenterCard from "./CenterCard";

export default function Cards() {
  const rightCardSize = "w-[225px] sm:w-[250px] md:w-[350px] lg:w-[400px] h-[400px] sm:h-[500px]"
  const rightShiftFactor = "translate-x-[68%] lg:translate-x-[55%] sm:translate-x-[70%]";
  const centerCardSize = "w-[250px] sm:w-[300px] md:w-[350px] h-[450px] sm:h-[550px]";


  return (
    <div className="relative w-full h-[550px] flex items-center justify-center">
      {/* Centered Group */}
      <div className="absolute left-1/2 top-1/2 -translate-x-8/12 lg:-translate-x-[61%] -translate-y-1/2 flex items-center justify-center w-full">
        {/* Center Card */}
        <div
          className={cn(
            "absolute rounded-2xl p-0.5 bg-white z-10 shadow-2xl",
            centerCardSize
          )}
        >
          <CenterCard />
        </div>

        {/* Right Card */}
        <div
          className={cn(
            "absolute rounded-2xl bg-white/80 z-0 shadow-lg",
            rightCardSize,
            rightShiftFactor
          )}
        >
          <RightLandingCard />
        </div>
      </div>
    </div>
  );

}
