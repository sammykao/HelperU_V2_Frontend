import React from 'react';
import { ClipboardPen, Share, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskSearchResponse } from '@/lib/api/tasks';
import { formatDate, formatPhone } from '@/lib/utils/format';

interface TaskDetailViewProps {
  task: TaskSearchResponse;
  isApplied: boolean;
  applicationMessage?: string;
  onShare: () => void;
  onApply: () => void;
}

export function TaskDetailView({
  task,
  isApplied,
  applicationMessage,
  onShare,
  onApply,
}: TaskDetailViewProps) {
  return (
    <div className="grid grid-cols-1 pt-4">
      <div className="lg:col-span-2">
        {/* Task title */}
        <div className="px-4 sm:px-6 mb-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
            {task.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="font-semibold text-green-600 text-base sm:text-lg">
              ${task.hourly_rate}/hr
            </span>
            <span className="text-gray-400">•</span>
            <span>
              {task.location_type === 'remote' 
                ? '🌐 Remote' 
                : task.city && task.state 
                  ? `📍 ${task.city}, ${task.state}` 
                  : `📍 ${task.zip_code}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 mb-6 w-full flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-start">
          <button
            onClick={onApply}
            disabled={isApplied}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex flex-row items-center justify-center gap-x-2 text-sm shadow-md active:scale-[0.98] transform',
              isApplied
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-lg'
            )}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Already Applied</span>
              </>
            ) : (
              <>
                <ClipboardPen className="w-4 h-4" />
                <span>Apply To Task</span>
              </>
            )}
          </button>
          <button
            onClick={onShare}
            className="bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-700 font-medium transition-all duration-200 flex flex-row items-center justify-center gap-x-2 text-sm shadow-sm hover:shadow-md active:scale-[0.98] transform"
          >
            <Share className="w-4 h-4" />
            <span>Share Task</span>
          </button>
        </div>

        {/* Application Message - Show if already applied */}
        {isApplied && applicationMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 sm:p-6 mb-4 mx-4 sm:mx-6 rounded-r-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Your Application
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {applicationMessage}
            </p>
          </div>
        )}

        {/* Client Contact Info */}
        <div className="bg-white border-t border-gray-400 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Client Information
          </h2>
          <div className="flex flex-col w-full justify-center items-start gap-y-2">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              Name: {task.client.first_name} {task.client.last_name}
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed flex flex-col sm:flex-row gap-x-2 gap-y-1">
              <span>Email:</span>
              <a
                href={`mailto:${task.client.email}`}
                className="text-blue-600 hover:underline break-all"
              >
                {task.client.email}
              </a>
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed flex flex-col sm:flex-row gap-x-2 gap-y-1">
              <span>Phone:</span>
              <a href={`tel:${task.client.phone}`} className="text-blue-600 hover:underline">
                {formatPhone(task.client.phone)}
              </a>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border-t border-gray-400 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Description
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        {/* Additional Information */}
        {(task.tools_info || task.public_transport_info) && (
          <div className="bg-white border-y border-gray-400 p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Additional Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {task.tools_info && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Tools Required
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700">{task.tools_info}</p>
                </div>
              )}
              {task.public_transport_info && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Public Transport
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700">
                    {task.public_transport_info}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="bg-white border-b border-gray-400 p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Available Dates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {task.dates.map((date, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-700">{formatDate(date)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

