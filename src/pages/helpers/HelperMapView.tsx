import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression, DivIcon } from 'leaflet';
import { helperApi, HelperResponse } from '../../lib/api/helpers';
import { taskApi, ZipCodeInfo, TaskSearchResponse } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HelperWithLocation extends HelperResponse {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
}

interface TaskWithLocation extends TaskSearchResponse {
  lat?: number;
  lng?: number;
}

interface LocationGroup {
  lat: number;
  lng: number;
  zip_code: string;
  city?: string;
  state?: string;
  helpers: HelperWithLocation[];
}

interface TaskLocationGroup {
  lat: number;
  lng: number;
  zip_code: string;
  city?: string;
  state?: string;
  tasks: TaskWithLocation[];
}

interface CombinedLocationGroup {
  lat: number;
  lng: number;
  zip_code: string;
  city?: string;
  state?: string;
  helpers: HelperWithLocation[];
  tasks: TaskWithLocation[];
}

function HelperMapView() {
  const { authRoute, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [helperLocationGroups, setHelperLocationGroups] = useState<LocationGroup[]>([]);
  const [taskLocationGroups, setTaskLocationGroups] = useState<TaskLocationGroup[]>([]);
  const [combinedLocationGroups, setCombinedLocationGroups] = useState<CombinedLocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([42.3601, -71.0589]); // Default to Boston

  // Create custom icon for helper with profile picture and count badge
  const createHelperIcon = (helper: HelperWithLocation, count: number = 1): DivIcon => {
    const hasMultiple = count > 1;
    const badgeHtml = hasMultiple 
      ? `<div style="position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 4px; border-radius: 10px; background: #ef4444; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10; white-space: nowrap;">${count}</div>`
      : '';
    
    if (helper.pfp_url) {
      return L.divIcon({
        className: 'custom-helper-icon',
        html: `<div style="position: relative; width: 40px; height: 40px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #3b82f6; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <img src="${helper.pfp_url}" alt="${helper.first_name}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          ${badgeHtml}
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });
    } else {
      // Fallback to colored circle with initials
      const initials = `${helper.first_name[0]}${helper.last_name[0]}`.toUpperCase();
      return L.divIcon({
        className: 'custom-helper-icon',
        html: `<div style="position: relative; width: 40px; height: 40px; z-index: 1;">
          <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #3b82f6; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative; z-index: 1;">${initials}</div>
          ${badgeHtml}
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });
    }
  };

  // Create custom icon for tasks with count badge
  const createTaskIcon = (count: number = 1): DivIcon => {
    const hasMultiple = count > 1;
    const badgeHtml = hasMultiple
      ? `<div style="position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 4px; border-radius: 10px; background: #ef4444; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10; white-space: nowrap;">${count}</div>`
      : '';
    
    return L.divIcon({
      className: 'custom-task-icon',
      html: `<div style="position: relative; width: 36px; height: 36px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg style="width: 20px; height: 20px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        ${badgeHtml}
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  // Create combined icon for locations with both helpers and tasks
  const createCombinedIcon = (helper: HelperWithLocation, helperCount: number, taskCount: number): DivIcon => {
    const totalCount = helperCount + taskCount;
    const badgeHtml = `<div style="position: absolute; top: -6px; right: -6px; min-width: 24px; height: 24px; padding: 0 5px; border-radius: 12px; background: #ef4444; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; line-height: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 1000; white-space: nowrap;">${totalCount}</div>`;
    
    // Helper icon (larger, on top)
    const helperIconHtml = helper.pfp_url
      ? `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #3b82f6; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative; z-index: 2;">
          <img src="${helper.pfp_url}" alt="${helper.first_name}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>`
      : `<div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #3b82f6; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative; z-index: 2;">${helper.first_name[0]}${helper.last_name[0]}</div>`;
    
    // Task icon (smaller, offset to bottom-right)
    const taskIconHtml = `<div style="position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; border-radius: 6px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white; z-index: 1;">
        <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>`;
    
    return L.divIcon({
      className: 'custom-combined-icon',
      html: `<div style="position: relative; width: 50px; height: 50px;">
        ${helperIconHtml}
        ${taskIconHtml}
        ${badgeHtml}
      </div>`,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
    });
  };

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'helper') {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get helper's zip code from profile
        const profileResponse = await import('../../lib/api/profile').then(m => m.profileApi.getProfile());
        const helperZipCode = profileResponse.profile?.helper?.zip_code;

        // Fetch tasks near helper's location
        let tasksList: TaskSearchResponse[] = [];
        if (helperZipCode) {
          try {
            const tasksResponse = await taskApi.getTasks({
              search_zip_code: helperZipCode,
              search_limit: 100,
              search_offset: 0,
              sort_by: 'post_date',
              distance_radius: 100,
            });
            tasksList = tasksResponse.tasks.filter(t => t.location_type === 'in_person' && t.zip_code);
          } catch (err) {
            console.error('Failed to load tasks:', err);
          }
        }

        // Fetch all helpers
        const helpersResponse = await helperApi.searchHelpers({ limit: 500 });
        const helpersList = helpersResponse.helpers.filter(h => h.zip_code);

        // Get unique zip codes from both tasks and helpers
        const allZipCodes = Array.from(
          new Set([
            ...tasksList.map(t => t.zip_code!),
            ...helpersList.map(h => h.zip_code!),
          ])
        );

        if (allZipCodes.length === 0) {
          setHelperLocationGroups([]);
          setTaskLocationGroups([]);
          setLoading(false);
          return;
        }

        // Fetch lat/lng for zip codes
        const zipCodeResponse = await taskApi.getZipCodes(allZipCodes);
        const zipCodeMap = new Map<string, ZipCodeInfo>(
          zipCodeResponse.result.map(zc => [zc.zip_code, zc])
        );

        // Enrich tasks with location data
        const tasksWithLocations: TaskWithLocation[] = tasksList
          .map(task => {
            const zipData = zipCodeMap.get(task.zip_code!);
            if (zipData) {
              return {
                ...task,
                lat: zipData.lat,
                lng: zipData.lng,
                city: zipData.city,
                state: zipData.state,
              } as TaskWithLocation;
            }
            return null;
          })
          .filter((t): t is TaskWithLocation => t !== null && t.lat !== undefined && t.lng !== undefined);

        // Enrich helpers with location data
        const helpersWithLocations: HelperWithLocation[] = helpersList
          .map(helper => {
            const zipData = zipCodeMap.get(helper.zip_code!);
            if (zipData) {
              return {
                ...helper,
                lat: zipData.lat,
                lng: zipData.lng,
                city: zipData.city,
                state: zipData.state,
              } as HelperWithLocation;
            }
            return null;
          })
          .filter((h): h is HelperWithLocation => h !== null && h.lat !== undefined && h.lng !== undefined);

        // Store in groups (helpers and tasks are stored in location groups)

        // Group helpers by location - use more precise grouping (6 decimal places = ~0.1m precision)
        const helperLocationMap = new Map<string, LocationGroup>();
        helpersWithLocations.forEach(helper => {
          if (!helper.lat || !helper.lng) return;
          
          // Use 6 decimal places for more precise grouping (only group if very close together)
          const locationKey = `${helper.lat.toFixed(6)}_${helper.lng.toFixed(6)}`;
          
          if (helperLocationMap.has(locationKey)) {
            helperLocationMap.get(locationKey)!.helpers.push(helper);
          } else {
            helperLocationMap.set(locationKey, {
              lat: helper.lat,
              lng: helper.lng,
              zip_code: helper.zip_code,
              city: helper.city,
              state: helper.state,
              helpers: [helper],
            });
          }
        });

        const helperGroups = Array.from(helperLocationMap.values());
        setHelperLocationGroups(helperGroups);

        // Group tasks by location - use more precise grouping (6 decimal places = ~0.1m precision)
        const taskLocationMap = new Map<string, TaskLocationGroup>();
        tasksWithLocations.forEach(task => {
          if (!task.lat || !task.lng) return;
          
          // Use 6 decimal places for more precise grouping (only group if very close together)
          const locationKey = `${task.lat.toFixed(6)}_${task.lng.toFixed(6)}`;
          
          if (taskLocationMap.has(locationKey)) {
            taskLocationMap.get(locationKey)!.tasks.push(task);
          } else {
            taskLocationMap.set(locationKey, {
              lat: task.lat,
              lng: task.lng,
              zip_code: task.zip_code!,
              city: task.city,
              state: task.state,
              tasks: [task],
            });
          }
        });

        const taskGroups = Array.from(taskLocationMap.values());
        
        // Check for overlapping locations between helpers and tasks
        // Use 4 decimal places for comparison (same precision for both)
        const combinedLocationMap = new Map<string, CombinedLocationGroup>();
        const standaloneHelperGroups: LocationGroup[] = [];
        const standaloneTaskGroups: TaskLocationGroup[] = [];

        // First, check each helper group against task groups
        helperGroups.forEach(helperGroup => {
          const helperLocationKey = `${helperGroup.lat.toFixed(4)}_${helperGroup.lng.toFixed(4)}`;
          
          // Find matching task group (within same 4-decimal precision)
          const matchingTaskGroup = taskGroups.find(taskGroup => 
            taskGroup.lat.toFixed(4) === helperGroup.lat.toFixed(4) &&
            taskGroup.lng.toFixed(4) === helperGroup.lng.toFixed(4)
          );

          if (matchingTaskGroup) {
            // Combined location - has both helpers and tasks
            combinedLocationMap.set(helperLocationKey, {
              lat: helperGroup.lat,
              lng: helperGroup.lng,
              zip_code: helperGroup.zip_code,
              city: helperGroup.city || matchingTaskGroup.city,
              state: helperGroup.state || matchingTaskGroup.state,
              helpers: helperGroup.helpers,
              tasks: matchingTaskGroup.tasks,
            });
          } else {
            // Standalone helper group
            standaloneHelperGroups.push(helperGroup);
          }
        });

        // Find task groups that don't have matching helpers
        taskGroups.forEach(taskGroup => {
          const taskLocationKey = `${taskGroup.lat.toFixed(4)}_${taskGroup.lng.toFixed(4)}`;
          
          if (!combinedLocationMap.has(taskLocationKey)) {
            standaloneTaskGroups.push(taskGroup);
          }
        });

        setHelperLocationGroups(standaloneHelperGroups);
        setTaskLocationGroups(standaloneTaskGroups);
        setCombinedLocationGroups(Array.from(combinedLocationMap.values()));

        // Set map center to average of all locations, or helper's location
        if (helperZipCode && zipCodeMap.has(helperZipCode)) {
          const helperZipData = zipCodeMap.get(helperZipCode)!;
          setMapCenter([helperZipData.lat, helperZipData.lng]);
        } else if (standaloneHelperGroups.length > 0 || standaloneTaskGroups.length > 0 || combinedLocationMap.size > 0) {
          const allLats = [
            ...standaloneHelperGroups.map(g => g.lat), 
            ...standaloneTaskGroups.map(t => t.lat),
            ...Array.from(combinedLocationMap.values()).map(c => c.lat)
          ];
          const allLngs = [
            ...standaloneHelperGroups.map(g => g.lng), 
            ...standaloneTaskGroups.map(t => t.lng),
            ...Array.from(combinedLocationMap.values()).map(c => c.lng)
          ];
          const avgLat = allLats.reduce((sum, lat) => sum + lat, 0) / allLats.length;
          const avgLng = allLngs.reduce((sum, lng) => sum + lng, 0) / allLngs.length;
          setMapCenter([avgLat, avgLng]);
        }
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, authRoute]);

  if (!isAuthenticated || authRoute !== 'helper') {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as a helper to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks & Helpers Map</h1>
          <p className="text-gray-600">
            View available tasks (green) and other helpers (blue) on the map. {combinedLocationGroups.length > 0 && `${combinedLocationGroups.length} combined location${combinedLocationGroups.length !== 1 ? 's' : ''}, `}{taskLocationGroups.length} task location{taskLocationGroups.length !== 1 ? 's' : ''}, and {helperLocationGroups.length} helper location{helperLocationGroups.length !== 1 ? 's' : ''} found.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200" style={{ height: '600px' }}>
          <MapContainer
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Combined Markers (Helpers + Tasks at same location) */}
            {combinedLocationGroups.map((group) => {
              const locationKey = `combined-${group.lat}_${group.lng}`;
              const firstHelper = group.helpers[0];
              
              return (
                <Marker
                  key={locationKey}
                  position={[group.lat, group.lng]}
                  icon={createCombinedIcon(firstHelper, group.helpers.length, group.tasks.length)}
                >
                  <Popup maxWidth={400}>
                    <div className="p-3 min-w-[280px] max-w-[400px]">
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {group.helpers.length} Helper{group.helpers.length !== 1 ? 's' : ''} & {group.tasks.length} Task{group.tasks.length !== 1 ? 's' : ''} at this location
                        </h3>
                        {group.city && group.state && (
                          <p className="text-xs text-gray-600 mt-1">
                            📍 {group.city}, {group.state}
                          </p>
                        )}
                      </div>
                      
                      {/* Helpers Section */}
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-blue-700 mb-2">Helpers ({group.helpers.length})</h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {group.helpers.map((helper, index) => (
                            <div key={helper.id} className={index > 0 ? "pt-2 border-t border-gray-100" : ""}>
                              <div className="flex items-start gap-2">
                                {helper.pfp_url ? (
                                  <img
                                    src={helper.pfp_url}
                                    alt={`${helper.first_name} ${helper.last_name}`}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                    {helper.first_name[0]}{helper.last_name[0]}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-900 text-xs mb-0.5">
                                    {helper.first_name} {helper.last_name}
                                  </h5>
                                  {helper.college && (
                                    <p className="text-xs text-gray-600">{helper.college}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tasks Section */}
                      <div>
                        <h4 className="text-xs font-semibold text-green-700 mb-2">Tasks ({group.tasks.length})</h4>
                        <div className="max-h-[200px] overflow-y-auto space-y-2">
                          {group.tasks.map((task, index) => (
                            <div key={task.id} className={index > 0 ? "pt-2 border-t border-gray-100" : ""}>
                              <h5 className="font-semibold text-gray-900 text-xs mb-0.5">{task.title}</h5>
                              <p className="text-xs font-medium text-green-700">${task.hourly_rate}/hr</p>
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams();
                                  params.set('page', 'tasks');
                                  params.set('taskId', task.id);
                                  params.set('search_query', task.title);
                                  navigate(`/dashboard?${params.toString()}`);
                                }}
                                className="mt-1 inline-block text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                              >
                                View Details →
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {/* Task Markers (standalone) */}
            {taskLocationGroups.map((group) => {
              const locationKey = `task-${group.lat}_${group.lng}`;
              const hasMultiple = group.tasks.length > 1;
              
              return (
                <Marker
                  key={locationKey}
                  position={[group.lat, group.lng]}
                  icon={createTaskIcon(group.tasks.length)}
                >
                  <Popup maxWidth={350}>
                    <div className="p-3 min-w-[250px] max-w-[350px]">
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {hasMultiple 
                            ? `${group.tasks.length} Tasks at this location`
                            : 'Task Details'
                          }
                        </h3>
                        {group.city && group.state && (
                          <p className="text-xs text-gray-600 mt-1">
                            📍 {group.city}, {group.state}
                          </p>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto space-y-3">
                        {group.tasks.map((task, index) => (
                          <div key={task.id} className={index > 0 ? "pt-3 border-t border-gray-100" : ""}>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
                            {task.client && (
                              <p className="text-xs text-gray-700 mb-1">
                                By: {task.client.first_name} {task.client.last_name}
                              </p>
                            )}
                            <p className="text-sm font-medium text-green-700 mb-1">
                              ${task.hourly_rate}/hr
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                            )}
                            <button
                              onClick={() => {
                                // Navigate to tasks page with task ID and search query set to task title
                                const params = new URLSearchParams();
                                params.set('page', 'tasks');
                                params.set('taskId', task.id);
                                params.set('search_query', task.title);
                                navigate(`/dashboard?${params.toString()}`);
                              }}
                              className="inline-block text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            >
                              View Details →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Helper Markers */}
            {helperLocationGroups.map((group) => {
              const locationKey = `helper-${group.lat}_${group.lng}`;
              const hasMultiple = group.helpers.length > 1;
              const firstHelper = group.helpers[0];

              return (
                <Marker
                  key={locationKey}
                  position={[group.lat, group.lng]}
                  icon={createHelperIcon(firstHelper, group.helpers.length)}
                >
                  <Popup maxWidth={350}>
                    <div className="p-3 min-w-[250px] max-w-[350px]">
                      <div className="mb-3 pb-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {hasMultiple 
                            ? `${group.helpers.length} Helpers at this location`
                            : 'Helper Details'
                          }
                        </h3>
                        {group.city && group.state && (
                          <p className="text-xs text-gray-600 mt-1">
                            📍 {group.city}, {group.state}
                          </p>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto space-y-3">
                        {group.helpers.map((helper, index) => (
                          <div key={helper.id} className={index > 0 ? "pt-3 border-t border-gray-100" : ""}>
                            <div className="flex items-start gap-2">
                              {helper.pfp_url ? (
                                <img
                                  src={helper.pfp_url}
                                  alt={`${helper.first_name} ${helper.last_name}`}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                  {helper.first_name[0]}{helper.last_name[0]}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                  {helper.first_name} {helper.last_name}
                                </h4>
                                {helper.college && (
                                  <p className="text-xs text-gray-700 mb-1">{helper.college}</p>
                                )}
                                {helper.graduation_year && (
                                  <p className="text-xs text-gray-600 mb-1">
                                    Class of {helper.graduation_year}
                                  </p>
                                )}
                                {helper.number_of_applications !== undefined && (
                                  <p className="text-xs text-blue-600 font-medium mb-1">
                                    📋 {helper.number_of_applications} application{helper.number_of_applications !== 1 ? 's' : ''}
                                  </p>
                                )}
                                {helper.bio && (
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{helper.bio}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {helperLocationGroups.length === 0 && taskLocationGroups.length === 0 && combinedLocationGroups.length === 0 && (
          <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
            <p className="text-gray-600">No tasks or helpers with location data available to display on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HelperMapView;

