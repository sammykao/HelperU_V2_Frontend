import React from 'react';
import { createPortal } from 'react-dom';
import { X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskSearchResponse } from '@/lib/api/tasks';

interface QuickApplyModalProps {
  isOpen: boolean;
  task: TaskSearchResponse | null;
  helperBio: string | null;
  isApplying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function QuickApplyModal({
  isOpen,
  task,
  helperBio,
  isApplying,
  onClose,
  onConfirm,
}: QuickApplyModalProps) {
  if (!isOpen || !task || !helperBio) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Quick Apply
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-4">
              Apply to <span className="font-semibold text-gray-900">{task.title}</span> using your
              bio as the introduction message?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Your Bio:</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {helperBio}
              </p>
            </div>

            <p className="text-xs text-gray-500">
              This will be sent as your introduction message to the client.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isApplying}
              className={cn(
                'flex-1 px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2',
                isApplying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              )}
            >
              {isApplying ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Applying...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Confirm Quick Apply
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

