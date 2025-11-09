import React, { useState, useEffect } from 'react';
import { taskApi, TaskSearchResponse, TaskSearchRequest } from '../../lib/api/tasks';
import { formatCurrency, formatDate, formatDistance, formatPhone } from '../../lib/utils/format';
import { profileApi } from '../../lib/api/profile';
import { applicationApi, ApplicationInfo } from '../../lib/api/applications';
import { useAuth } from '../../lib/contexts/AuthContext';
import toast from 'react-hot-toast';
import { ClipboardPen, Share } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchTasks } from '@/components/tasks/SearchTasks';

function BrowseTasks() {
  const { authRoute } = useAuth();
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
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'post_date'>('post_date');
  const [distanceRadius, setDistanceRadius] = useState<number | undefined>(100);
  const [selectedTask, setTask] = useState<TaskSearchResponse | null>(null);

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
              setTotalCount(response.tasks.length < response.limit ?
                response.tasks.length :
                response.tasks.length + 1
              );
              setHasSearched(true);
              setTask(response.tasks[0])
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

  // Filter tasks to remove those already applied to (for helpers)
  useEffect(() => {
    if (authRoute === 'helper' && applications.length > 0) {
      const appliedTaskIds = new Set(applications.map(app => app.task_id));
      const filtered = tasks.filter(task => !appliedTaskIds.has(task.id));
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [tasks, applications, authRoute]);

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

      if ((searchParams.search_offset || 0) === 0) {
        // First page or new search - replace tasks
        setTasks(response.tasks);
      } else {
        // Load more - append tasks
        setTasks(prev => [...prev, ...response.tasks]);
      }

      // Update total count based on whether we got a full page
      setTotalCount(response.tasks.length < response.limit ?
        ((searchParams.search_offset || 0) + response.tasks.length) :
        ((searchParams.search_offset || 0) + response.tasks.length + 1)
      );
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

  return (
    <div className="min-h-screen h-full bg-white w-full py-6">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-18 ">
        {/* Header */}
        <div className="mb-1 sm:mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Browse Opportunities</h1>
          <p className="text-sm sm:text-base text-gray-700">
            {hasSearched
              ? `Showing opportunities near ${searchParams.search_zip_code} - modify filters below to refine your search`
              : 'Find posts that match your skills and interests'
            }
          </p>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mb-4">
            <p className="text-sm sm:text-base text-gray-700">
              {filteredTasks.length} opportunit{filteredTasks.length !== 1 ? 'ies' : 'y'} found
            </p>
          </div>
        )}

        {/* Search Bar */}
        <SearchTasks searchParams={searchParams} setSearchParams={setSearchParams} handleSearch={handleSearch} />

        <div className='bg-white w-full h-full grid grid-cols-[2fr_3fr] gap-x-2 rounded-md p-1'>
          <div>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 border border-gray-300 rounded-2xl h-[650px]">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 p-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
                <p className="text-gray-700">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className='flex flex-col gap-y-4 items-center justify-center'>
                <div className='flex flex-col justify-start items-start w-full space-y-2 overflow-y-auto h-[595px]' style={{ scrollbarWidth: "none" }}>
                  {filteredTasks.map((task, idx) => (
                    <div className={cn('flex flex-row gap-x-2 items-start justify-start w-full h-fit px-2 border border-slate-300 rounded-2xl py-4', (selectedTask && task.id === selectedTask.id) ? "bg-gray-200" : "bg-white hover:bg-gray-100")} key={idx}>
                      <div className='mt-2 mr-2'>
                        {task.client.pfp_url ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                            <img
                              src={task.client.pfp_url}
                              alt={`${task.client.first_name} ${task.client.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className='w-12 h-12 flex justify-center items-center rounded-full bg-slate-100'>
                            {task.client.first_name.slice(0, 1)} {task.client.last_name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex flex-col items-start justify-center w-full py-2 text-xs sm:text-sm text-gray-700 tracking-tight cursor-pointer`}
                        onClick={() => setTask(task)}
                      >
                        <span className='font-bold'>{task.title}</span>
                        <span className='text-green-700 '>${task.hourly_rate}/hr</span>
                        <span className=''>{task.location_type === "remote" ? "Remote" : `Zipcode: ${task.zip_code}`}</span>
                        <span className="truncate ">
                          Posted by {task.client.first_name} {task.client.last_name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='w-full h-fit'>
                  <button
                    className={cn('h-10 py-2 w-full bg-blue-500 hover:bg-blue-500/90 flex justify-center items-center rounded-md text-white active:scale-[99%]')}
                    onClick={loadMore}
                  >
                    Load More
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className='border rounded-2xl border-gray-300 h-[650px] overflow-y-auto overflow-x-hidden scroll-x-1 scroll-my-6'>
            {selectedTask ? (
              <div className="grid grid-cols-1 pt-4">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Task title */}
                  <div className='ml-4 mb-4 text-3xl tracking-tight'>
                    {selectedTask.title}
                  </div>

                  <div className='ml-4 mb-4 w-full flex flex-row gap-x-2 items-center justify-start'>
                    <button className='bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 active:scale-95 text-white transition-all duration-300 flex flex-row items-center justify-center gap-x-2'>
                      <ClipboardPen />
                      Apply To Task
                    </button>
                    <button className=' bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 active:scale-95 text-black transition-all duration-300 flex flex-row items-center justify-center gap-x-2'>
                      <Share />
                      Share Task</button>
                  </div>

                  {/* Client Contact Info */}
                  <div className="bg-white border-t border-gray-400 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                    <div className='flex flex-col w-full justify-center items-start gap-y-2'>
                      <p className="text-gray-700 leading-relaxed">Name: {selectedTask.client.first_name} {selectedTask.client.last_name}</p>
                      <p className="text-gray-700 leading-relaxed flex flex-row gap-x-2 justify-center">
                        Email:
                        <a href={`mailto:${selectedTask.client.email}`}>{selectedTask.client.email}</a>

                      </p>
                      <p className="text-gray-700 leading-relaxed flex flex-row gap-x-2 justify-center">
                        Phone:
                        <a href={`tel:${selectedTask.client.phone}`}>{formatPhone(selectedTask.client.phone)}</a>

                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white border-t border-gray-400 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>

                  {/* Additional Information */}
                  {(selectedTask.tools_info || selectedTask.public_transport_info) && (
                    <div className="bg-white border-y border-gray-400 p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                      <div className="space-y-4">
                        {selectedTask.tools_info && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tools Required</h3>
                            <p className="text-gray-700">{selectedTask.tools_info}</p>
                          </div>
                        )}
                        {selectedTask.public_transport_info && (
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Public Transport</h3>
                            <p className="text-gray-700">{selectedTask.public_transport_info}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="bg-white  border-b border-gray-400 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Dates</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTask.dates.map((date, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-gray-700">{formatDate(date)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            ) : (
              <div className="rounded-2xl p-6 py-12 mx-4 h-full w-full flex flex-col items-center justify-start overflow-y-hidden">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">No Task Selected</h2>
                <p>Please click on a task on the left to view details</p>
              </div>

            )}
          </div>
        </div>

      </div>
    </div >
  );
};

export default BrowseTasks;
