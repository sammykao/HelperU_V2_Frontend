import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { cn, formatDistance } from '@/lib/utils';
import { TaskSearchResponse } from '@/lib/api/tasks';

interface TaskCardProps {
  task: TaskSearchResponse;
  isSelected: boolean;
  isApplied: boolean;
  isMobile?: boolean;
  isQuickApplying?: boolean;
  canQuickApply?: boolean;
  hasHelperBio?: boolean;
  onSelect: () => void;
  onQuickApply?: (e: React.MouseEvent) => void;
}

export function TaskCard({
  task,
  isSelected,
  isApplied,
  isMobile = false,
  isQuickApplying = false,
  canQuickApply = false,
  hasHelperBio = false,
  onSelect,
  onQuickApply,
}: TaskCardProps) {
  if (isMobile) {
    return (
      <div
        className={cn(
          'flex-shrink-0 w-[280px] border rounded-xl p-4 cursor-pointer transition-all snap-start relative',
          isSelected
            ? 'bg-blue-50 border-blue-400 shadow-md'
            : 'bg-white border-gray-300 hover:border-blue-300 hover:shadow-sm',
          isApplied && 'opacity-90'
        )}
        onClick={onSelect}
      >
        {isApplied && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-green-500 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 z-10">
            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Applied</span>
          </div>
        )}
        <div className="flex items-start gap-3 mb-3">
          {task.client.pfp_url ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gray-200">
              <img
                src={task.client.pfp_url}
                alt={`${task.client.first_name} ${task.client.last_name}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 flex justify-center items-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-sm border-2 border-gray-200">
              {task.client.first_name.slice(0, 1)}
              {task.client.last_name.slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{task.title}</h3>
            <p className="text-green-600 font-semibold text-sm">${task.hourly_rate}/hr</p>
          </div>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <p>
            {task.location_type === 'remote' 
              ? '🌐 Remote' 
              : task.city && task.state 
                ? `📍 ${task.city}, ${task.state}` 
                : `📍 ${task.zip_code}`}
          </p>
          <p className="truncate">
            by {task.client.first_name} {task.client.last_name}
          </p>
        </div>
        {/* Distance field */}
        <div className="text-xs text-gray-500">
          {task.distance !== undefined && task.distance !== null && (
            <span>• {formatDistance(task.distance)} away</span>
          )}
        </div>
        {/* Quick Apply Button - Mobile */}
        {canQuickApply && !isApplied && (
          <button
            onClick={onQuickApply}
            disabled={isQuickApplying || !hasHelperBio}
            className={cn(
              'absolute bottom-2 right-2 px-3 py-1.5 rounded-lg transition-all z-10 flex items-center gap-1.5 text-xs font-medium',
              isQuickApplying || !hasHelperBio
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md active:scale-95'
            )}
            title={
              !hasHelperBio
                ? 'Add a bio to your profile to use quick apply'
                : 'Quick apply with your bio'
            }
          >
            {isQuickApplying ? (
              <svg
                className="animate-spin h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Quick Apply</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div
      className={cn(
        'flex flex-row gap-x-2 items-start justify-start w-full h-fit px-2.5 border border-slate-300 rounded-lg py-3 cursor-pointer transition-all relative group',
        isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50',
        isApplied && 'opacity-90'
      )}
      onClick={onSelect}
    >
      {isApplied && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5 z-10">
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>Applied</span>
        </div>
      )}
      <div className="mt-1 mr-2 flex-shrink-0">
        {task.client.pfp_url ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-gray-200">
            <img
              src={task.client.pfp_url}
              alt={`${task.client.first_name} ${task.client.last_name}`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 flex justify-center items-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs border-2 border-gray-200">
            {task.client.first_name.slice(0, 1)}
            {task.client.last_name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-col items-start justify-start w-full py-1 text-xs text-gray-700 tracking-tight min-w-0 flex-1">
        <span className="font-bold text-gray-900 mb-0.5 line-clamp-2 leading-tight">
          {task.title}
        </span>
        <span className="text-green-600 font-semibold text-xs mb-0.5">
          ${task.hourly_rate}/hr
        </span>
        <span className="text-gray-600 text-xs mb-0.5 truncate w-full">
          {task.location_type === 'remote' 
            ? '🌐 Remote' 
            : task.city && task.state 
              ? `📍 ${task.city}, ${task.state}` 
              : `📍 ${task.zip_code}`}
        </span>
        {/* Distance field, more emojis */}
        <span className="text-gray-500 text-xs truncate w-full">
          {task.distance !== undefined && task.distance !== null && (
            <span>🌍 {formatDistance(task.distance)} away</span>
          )}
        </span>
        <span className="text-gray-500 text-xs truncate w-full">
          by {task.client.first_name} {task.client.last_name}
        </span>
      </div>
      {/* Quick Apply Button - Desktop Sidebar */}
      {canQuickApply && !isApplied && (
        <button
          onClick={onQuickApply}
          disabled={isQuickApplying || !hasHelperBio}
          className={cn(
            'absolute bottom-2 right-2 px-2.5 py-1.5 rounded-lg transition-all z-10 flex items-center gap-1.5 text-[10px] font-medium',
            isQuickApplying || !hasHelperBio
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md active:scale-95'
          )}
          title={
            !hasHelperBio
              ? 'Add a bio to your profile to use quick apply'
              : 'Quick apply with your bio'
          }
        >
          {isQuickApplying ? (
            <svg
              className="animate-spin h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <>
              <Zap className="w-3 h-3" />
              <span>Quick Apply</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

