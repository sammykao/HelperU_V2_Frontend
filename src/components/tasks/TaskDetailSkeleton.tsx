export function TaskDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 pt-4">
      <div className="lg:col-span-2">
        <div className="px-4 sm:px-6 mb-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>

        <div className="px-4 sm:px-6 mb-6 flex gap-2">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
        </div>

        <div className="bg-white border-t border-gray-400 p-4 sm:p-6 shadow-sm mb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        </div>

        <div className="bg-white border-t border-gray-400 p-4 sm:p-6 shadow-sm mb-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-3 w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

