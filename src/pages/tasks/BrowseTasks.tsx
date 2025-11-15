import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskApi, TaskSearchResponse, TaskSearchRequest } from '../../lib/api/tasks';
import { profileApi } from '../../lib/api/profile';
import { applicationApi, ApplicationInfo, ApplicationCreateData } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { SearchTasks } from '@/components/tasks/SearchTasks';
import { TaskCardSkeleton } from '@/components/tasks/TaskCardSkeleton';
import { TaskDetailSkeleton } from '@/components/tasks/TaskDetailSkeleton';
import { TaskDetailView } from '@/components/tasks/TaskDetailView';
import { TaskCard } from '@/components/tasks/TaskCard';
import { QuickApplyModal } from '@/components/tasks/modals/QuickApplyModal';
import { ApplicationModal } from '@/components/tasks/modals/ApplicationModal';

function BrowseTasks() {
  const { authRoute } = useAuth();
  const [searchParamsUrl] = useSearchParams();
  const [tasks, setTasks] = useState<TaskSearchResponse[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskSearchResponse[]>([]);
  const [applications, setApplications] = useState<ApplicationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<TaskSearchRequest>({
    search_zip_code: '', // Will be set from user profile
    search_limit: 20,
    search_offset: 0,
    sort_by: 'post_date',
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy] = useState<'distance' | 'post_date'>('post_date');
  const [distanceRadius] = useState<number | undefined>(100);
  const [selectedTask, setTask] = useState<TaskSearchResponse | null>(null);
  const [hasMoreTasks, setHasMoreTasks] = useState(false);
  const [lastAppliedUrlTaskId, setLastAppliedUrlTaskId] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [quickApplying, setQuickApplying] = useState<string | null>(null); // Track which task is being quick applied
  const [showQuickApplyModal, setShowQuickApplyModal] = useState(false);
  const [taskToQuickApply, setTaskToQuickApply] = useState<TaskSearchResponse | null>(null);
  const [helperBio, setHelperBio] = useState<string | null>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Get task ID from URL query string
  const taskIdFromUrl = searchParamsUrl.get('taskId');

  // Load applications for helper
  const loadApplications = async () => {
    if (authRoute !== 'helper') return;

    try {
      const response = await applicationApi.getApplicationsByHelper();
      setApplications(response.applications.map(app => app.application));
    } catch (error) {
      console.error('Failed to load applications:', error);
    }
  };

  // Fetch user profile and set zip code on mount, then automatically load tasks
  useEffect(() => {
    const initializeZipCodeAndLoadTasks = async () => {
      if (authRoute === 'helper') {
        // Load applications first
        await loadApplications();

        try {
          const profileResponse = await profileApi.getProfile();
          // Load helper bio for quick apply
          if (profileResponse.profile?.helper?.bio) {
            setHelperBio(profileResponse.profile.helper.bio);
          }

          if (profileResponse.profile?.helper?.zip_code) {
            const zipCode = profileResponse.profile!.helper!.zip_code!;
            setSearchParams(prev => ({
              ...prev,
              search_zip_code: zipCode
            }));

            // Automatically load tasks with the user's ZIP code
            setIsLoading(true);
            try {
              const response = await taskApi.getTasks({
                search_zip_code: zipCode,
                search_limit: 20,
                search_offset: 0,
                sort_by: 'post_date',
                distance_radius: distanceRadius,
              });

              setTasks(response.tasks);
              setHasSearched(true);

              // Select task from URL if provided, otherwise select first task
              if (taskIdFromUrl) {
                const taskFromUrl = response.tasks.find(t => t.id === taskIdFromUrl);
                if (taskFromUrl) {
                  setTask(taskFromUrl);
                  setLastAppliedUrlTaskId(taskIdFromUrl);
                } else {
                  setTask(response.tasks[0] || null);
                }
              } else {
                setTask(response.tasks[0] || null);
              }
            } catch (error: any) {
              toast.error('Failed to load tasks');
              console.error('Error fetching tasks:', error);
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.log('Could not fetch profile for zip code');
        }
      }
    };

    initializeZipCodeAndLoadTasks();
  }, [authRoute]);

  // Helper function to check if a task has been applied to
  const isTaskApplied = (taskId: string): boolean => {
    if (authRoute !== 'helper') return false;
    return applications.some(app => app.task_id === taskId);
  };

  // Helper function to get the application message for a task
  const getApplicationMessage = (taskId: string): string | undefined => {
    if (authRoute !== 'helper') return undefined;
    const application = applications.find(app => app.task_id === taskId);
    return application?.introduction_message;
  };

  // Show all tasks (don't filter out applied ones)
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  // Handle taskId from URL query string when tasks are already loaded
  // Only apply if it's different from what we last applied, or if no task is selected
  useEffect(() => {
    if (taskIdFromUrl && tasks.length > 0 && taskIdFromUrl !== lastAppliedUrlTaskId) {
      const taskFromUrl = tasks.find(t => t.id === taskIdFromUrl);
      if (taskFromUrl) {
        setTask(taskFromUrl);
        setLastAppliedUrlTaskId(taskIdFromUrl);
      }
    }
  }, [taskIdFromUrl, tasks, lastAppliedUrlTaskId]);

  const fetchTasks = async () => {
    setIsLoading(true);

    // Reload applications for helpers
    if (authRoute === 'helper') {
      await loadApplications();
    }

    try {
      const response = await taskApi.getTasks({
        ...searchParams,
        distance_radius: distanceRadius,
      });

      // Update total count and hasMoreTasks flag
      const hasMore = response.tasks.length >= (response.limit || 20);
      setHasMoreTasks(hasMore);

      if ((searchParams.search_offset || 0) === 0) {
        // First page or new search - replace tasks
        setTasks(response.tasks);

        // Select task from URL if provided and different from last applied, otherwise select first task if none selected
        if (taskIdFromUrl && taskIdFromUrl !== lastAppliedUrlTaskId) {
          const taskFromUrl = response.tasks.find(t => t.id === taskIdFromUrl);
          if (taskFromUrl) {
            setTask(taskFromUrl);
            setLastAppliedUrlTaskId(taskIdFromUrl);
          } else if (response.tasks.length > 0 && !selectedTask) {
            setTask(response.tasks[0]);
          }
        } else if (response.tasks.length > 0 && !selectedTask) {
          setTask(response.tasks[0]);
        }
      } else {
        // Load more - append tasks
        const previousTaskCount = tasks.length;
        setTasks(prev => [...prev, ...response.tasks]);

        // On mobile, scroll carousel to show newly loaded tasks
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          if (carouselRef.current && previousTaskCount > 0) {
            // Scroll to show the first newly loaded task
            // Card width: 280px, gap: 12px (gap-3 = 0.75rem)
            const cardWidth = 280;
            const gap = 12;
            const scrollPosition = previousTaskCount * (cardWidth + gap);
            carouselRef.current.scrollTo({
              left: scrollPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.search_zip_code.trim()) {
      toast.error('ZIP code is required');
      return;
    }
    setSearchParams(prev => ({ ...prev, search_offset: 0 }));
    setHasSearched(true);
    setHasMoreTasks(false); // Reset on new search
    fetchTasks();
  };

  // On sort change, push to server-side sort and reset pagination
  useEffect(() => {
    setSearchParams(prev => ({ ...prev, sort_by: sortBy, search_offset: 0 } as any));
  }, [sortBy]);

  // Auto-search when filters or pagination change (debounced)
  useEffect(() => {
    if (!hasSearched || !searchParams.search_zip_code) return;

    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    searchParams.search_query,
    searchParams.search_location_type,
    searchParams.min_hourly_rate,
    searchParams.max_hourly_rate,
    searchParams.search_offset,
    searchParams.search_limit,
    searchParams.search_zip_code,
    distanceRadius,
    hasSearched
  ]);

  const loadMore = () => {
    setSearchParams(prev => ({
      ...prev,
      search_offset: (prev.search_offset || 0) + (prev.search_limit || 20)
    }));
  };

  const handleShare = async () => {
    if (!selectedTask) return;

    // Create share URL - using task ID to navigate to browse page with task selected
    const taskUrl = `${window.location.origin}/dashboard?taskId=${selectedTask.id}`;
    const shareText = `Check out this task: ${selectedTask.title} - $${selectedTask.hourly_rate}/hr`;

    if (navigator.share) {
      // Use native share API if available (mobile)
      try {
        await navigator.share({
          title: selectedTask.title,
          text: shareText,
          url: taskUrl,
        });
        toast.success('Task shared!');
      } catch (err: any) {
        // User cancelled or error occurred, fall back to clipboard
        if (err.name !== 'AbortError') {
          await copyToClipboard(taskUrl);
        }
      }
    } else {
      // Fall back to clipboard copy
      await copyToClipboard(taskUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (!selectedTask) return;

    if (authRoute !== 'helper') {
      toast.error('Only helpers can apply for tasks');
      return;
    }

    if (isTaskApplied(selectedTask.id)) {
      toast.error('You have already applied to this task');
      return;
    }

    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedTask || !applicationMessage.trim()) {
      toast.error('Please enter an introduction message');
      return;
    }

    try {
      setApplying(true);

      const applicationData: ApplicationCreateData = {
        introduction_message: applicationMessage.trim(),
        supplements_url: undefined
      };

      await applicationApi.createApplication(selectedTask.id, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplicationModal(false);
      setApplicationMessage('');

      // Reload applications to update the UI
      await loadApplications();
    } catch (err: any) {
      console.error('Failed to apply:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to submit application. Please try again.';
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleQuickApplyClick = (task: TaskSearchResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task selection when clicking quick apply

    if (authRoute !== 'helper') {
      toast.error('Only helpers can apply for tasks');
      return;
    }

    if (isTaskApplied(task.id)) {
      toast.error('You have already applied to this task');
      return;
    }

    if (!helperBio || !helperBio.trim()) {
      toast.error('Please add a bio to your profile to use quick apply');
      return;
    }

    // Show confirmation modal
    setTaskToQuickApply(task);
    setShowQuickApplyModal(true);
  };

  const handleQuickApplyConfirm = async () => {
    if (!taskToQuickApply) return;

    const taskId = taskToQuickApply.id;

    try {
      setQuickApplying(taskId);
      setShowQuickApplyModal(false);

      const applicationData: ApplicationCreateData = {
        introduction_message: helperBio!.trim(),
        supplements_url: undefined
      };

      await applicationApi.createApplication(taskId, applicationData);
      toast.success('Quick applied successfully!');

      // Reload applications to update the UI
      await loadApplications();

      // Select the task to show it as applied
      setTask(taskToQuickApply);
    } catch (err: any) {
      console.error('Failed to quick apply:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to submit application. Please try again.';
      toast.error(errorMessage);
    } finally {
      setQuickApplying(null);
      setTaskToQuickApply(null);
    }
  };

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showApplicationModal || showQuickApplyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showApplicationModal, showQuickApplyModal]);

  return (
    <div className="min-h-screen h-full bg-linear-to-br from-gray-50 to-blue-50 w-full py-4 sm:py-6">

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Browse Opportunities</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {hasSearched
              ? `Showing opportunities near ${searchParams.search_zip_code} - modify filters below to refine your search`
              : 'Find posts that match your skills and interests'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <SearchTasks searchParams={searchParams} setSearchParams={setSearchParams} handleSearch={handleSearch} />
        </div>

        {/* Mobile: Horizontal Carousel + Details Below */}
        <div className='lg:hidden flex flex-col gap-4'>
          {isLoading && !hasSearched ? (
            <>
              {/* Loading Skeleton for Mobile Carousel */}
              <div className='relative'>
                <div className='flex overflow-x-auto gap-3 pb-4 px-1 scrollbar-hide'>
                  {[...Array(3)].map((_, idx) => (
                    <TaskCardSkeleton key={idx} isMobile={true} />
                  ))}
                </div>
              </div>
              {/* Loading Skeleton for Task Details */}
              <div className='bg-white border rounded-xl border-gray-300 overflow-hidden shadow-sm'>
                <TaskDetailSkeleton />
              </div>
            </>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 border border-gray-300 rounded-xl h-[300px] flex flex-col items-center justify-center bg-white">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center mx-auto mb-4 p-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-sm text-gray-700">Try adjusting your search criteria</p>
            </div>
          ) : (
            <>
              {/* Horizontal Swipeable Carousel */}
              <div className='relative'>
                <div
                  ref={carouselRef}
                  className='flex overflow-x-auto gap-3 pb-4 px-1 scrollbar-hide'
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    scrollSnapType: 'x mandatory',
                  }}
                >
                  {filteredTasks.map((task, idx) => (
                    <TaskCard
                      key={task.id || idx}
                      task={task}
                      isSelected={selectedTask?.id === task.id}
                      isApplied={isTaskApplied(task.id)}
                      isMobile={true}
                      isQuickApplying={quickApplying === task.id}
                      canQuickApply={authRoute === 'helper'}
                      hasHelperBio={!!helperBio}
                      onSelect={() => setTask(task)}
                      onQuickApply={(e) => handleQuickApplyClick(task, e)}
                    />
                  ))}

                  {/* Load More Button - At End of Carousel */}
                  {hasMoreTasks && (
                    <div className='flex-shrink-0 w-[280px] snap-start flex items-center justify-center'>
                      <button
                        disabled={isLoading}
                        className={cn(
                          'w-full h-full min-h-[140px] bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 flex flex-col justify-center items-center rounded-xl text-white active:scale-[99%] text-sm font-medium transition-all shadow-sm border border-blue-400',
                          isLoading && 'opacity-70'
                        )}
                        onClick={loadMore}
                      >
                        {isLoading ? (
                          <span className="flex flex-col items-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading...</span>
                          </span>
                        ) : (
                          <span>Load More</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Details Below Carousel on Mobile */}
              {selectedTask && (
                <div className='bg-white border rounded-xl border-gray-300 overflow-hidden shadow-sm'>
                  <TaskDetailView
                    task={selectedTask}
                    isApplied={isTaskApplied(selectedTask.id)}
                    applicationMessage={getApplicationMessage(selectedTask.id)}
                    onShare={handleShare}
                    onApply={handleApply}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Desktop: Side-by-side Layout */}
        <div className='hidden lg:grid lg:grid-cols-[320px_1fr] gap-4 bg-white w-full rounded-xl sm:rounded-2xl p-4 shadow-lg border border-gray-200'>
          <div className="flex flex-col min-h-0 w-full max-w-[320px] h-[650px]">
            {isLoading && !hasSearched ? (
              <div className='flex flex-col gap-y-3 h-full min-h-0 w-full'>
                <div className='flex flex-col justify-start items-start w-full space-y-2 overflow-y-auto flex-1 min-h-0 pr-1'>
                  {[...Array(5)].map((_, idx) => (
                    <TaskCardSkeleton key={idx} isMobile={false} />
                  ))}
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 border border-gray-300 rounded-xl h-[650px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 p-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-base text-gray-700">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className='flex flex-col gap-y-3 h-full min-h-0 w-full'>
                <div className='flex flex-col justify-start items-start w-full space-y-2 overflow-y-auto flex-1 min-h-0 pr-1' style={{ scrollbarWidth: "thin" }}>
                  {filteredTasks.map((task, idx) => (
                    <TaskCard
                      key={task.id || idx}
                      task={task}
                      isSelected={selectedTask?.id === task.id}
                      isApplied={isTaskApplied(task.id)}
                      isMobile={false}
                      isQuickApplying={quickApplying === task.id}
                      canQuickApply={authRoute === 'helper'}
                      hasHelperBio={!!helperBio}
                      onSelect={() => setTask(task)}
                      onQuickApply={(e) => handleQuickApplyClick(task, e)}
                    />
                  ))}
                </div>

                {hasMoreTasks && (
                  <div className='w-full h-fit pt-2 border-t border-gray-200 flex-shrink-0 mt-auto'>
                    <button
                      disabled={isLoading}
                      className={cn('h-9 py-1.5 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 flex justify-center items-center rounded-lg text-white active:scale-[99%] text-xs font-medium transition-all shadow-sm hover:shadow-md whitespace-nowrap', isLoading && 'opacity-70')}
                      onClick={loadMore}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-xs">Loading...</span>
                        </span>
                      ) : (
                        <span className="text-xs">Load More</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className='border rounded-xl border-gray-300 h-[650px] overflow-y-auto overflow-x-hidden bg-white shadow-sm scrollbar-hide'>
            {isLoading && !hasSearched ? (
              <TaskDetailSkeleton />
            ) : selectedTask ? (
              <TaskDetailView
                task={selectedTask}
                isApplied={isTaskApplied(selectedTask.id)}
                applicationMessage={getApplicationMessage(selectedTask.id)}
                onShare={handleShare}
                onApply={handleApply}
              />
            ) : (
              <div className="rounded-xl p-6 py-16 mx-4 h-full w-full flex flex-col items-center justify-center overflow-y-hidden bg-linear-to-br from-gray-50 to-blue-50">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Task Selected</h2>
                <p className="text-base text-gray-600 text-center px-4 max-w-sm">Click on a task from the list to view full details</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <QuickApplyModal
        isOpen={showQuickApplyModal}
        task={taskToQuickApply}
        helperBio={helperBio}
        isApplying={quickApplying === taskToQuickApply?.id}
        onClose={() => {
          setShowQuickApplyModal(false);
          setTaskToQuickApply(null);
        }}
        onConfirm={handleQuickApplyConfirm}
      />

      <ApplicationModal
        isOpen={showApplicationModal}
        applicationMessage={applicationMessage}
        isApplying={applying}
        onClose={() => {
          setShowApplicationModal(false);
          setApplicationMessage('');
        }}
        onMessageChange={setApplicationMessage}
        onSubmit={handleSubmitApplication}
      />
    </div >
  );
};

export default BrowseTasks;
