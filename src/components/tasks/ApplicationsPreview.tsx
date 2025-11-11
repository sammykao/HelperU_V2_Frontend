import React from 'react';
import { ApplicationResponse } from '../../lib/api/applications';

interface ApplicationsPreviewProps {
  postId: string;
  applications: ApplicationResponse[];
  applicationsLoading: boolean;
  onViewAll: (postId: string) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ApplicationsPreview: React.FC<ApplicationsPreviewProps> = ({
  postId,
  applications,
  applicationsLoading,
  onViewAll
}) => {
  const getApplicationsForPost = (postId: string): ApplicationResponse[] => {
    return applications.filter(app => app.application.task_id === postId);
  };

  const postApplications = getApplicationsForPost(postId);

  if (applicationsLoading) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-600">
          <div className="animate-spin rounded-full h-4 border-b-2 border-gray-400 mr-2"></div>
          <span className="text-sm">Loading applications...</span>
        </div>
      </div>
    );
  }

  if (postApplications.length === 0) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">No applications yet</span>
        </div>
      </div>
    );
  }

  const displayApplications = postApplications.slice(0, 2);
  const hasMore = postApplications.length > 2;

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-blue-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium">
            {postApplications.length} application{postApplications.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => onViewAll(postId)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          View all
        </button>
      </div>

      <div className="space-y-2">
        {displayApplications.map((app) => (
          <div key={app.application.id} className="bg-white rounded-md p-2 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-blue-700">
                    {app.helper.first_name.charAt(0)}{app.helper.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {app.helper.first_name} {app.helper.last_name}
                  </div>
                  <div className="text-xs text-gray-600">{app.helper.college}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(app.application.created_at)}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-700 line-clamp-2">
              {app.application.introduction_message}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="text-center">
            <button
              onClick={() => onViewAll(postId)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              +{postApplications.length - 2} more application{postApplications.length - 2 !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPreview;
