interface TaskCardSkeletonProps {
  isMobile?: boolean;
}

export function TaskCardSkeleton({ isMobile = false }: TaskCardSkeletonProps) {
  if (isMobile) {
    return (
      <div className="flex-shrink-0 w-[280px] border rounded-xl p-4 bg-white border-gray-300">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-x-2 items-start justify-start w-full h-fit px-2.5 border border-slate-300 rounded-lg py-3 bg-white">
      <div className="mt-1 mr-2 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
      </div>
      <div className="flex flex-col items-start justify-start w-full py-1 min-w-0 flex-1 space-y-1.5">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  );
}

