import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { helperApi, HelperResponse } from '../../lib/api/helpers';
import { taskApi, ZipCodeInfo, TaskResponse } from '../../lib/api/tasks';
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

interface LocationGroup {
  lat: number;
  lng: number;
  zip_code: string;
  city?: string;
  state?: string;
  helpers: HelperWithLocation[];
}

function MapView() {
  const { authRoute, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const taskIdFromUrl = searchParams.get('taskId');
  const [helpers, setHelpers] = useState<HelperWithLocation[]>([]);
  const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([42.3601, -71.0589]); // Default to Boston
  const [task, setTask] = useState<TaskResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authRoute !== 'client') {
      return;
    }

    const loadHelpersWithLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load task data if taskId is provided
        let taskData: TaskResponse | null = null;
        if (taskIdFromUrl) {
          try {
            const taskResponse = await taskApi.getMyTasks(100, 0);
            taskData = taskResponse.tasks.find(t => t.id === taskIdFromUrl) || null;
            setTask(taskData);
          } catch (err) {
            console.error('Failed to load task:', err);
          }
        }

        // Build search request - filter by task zip code if available
        const searchRequest: any = {
          limit: 500, // Increased limit to show more helpers
          offset: 0,
        };

        // If task is provided and has zip code, filter helpers by that zip code
        if (taskData && taskData.zip_code && taskData.location_type === 'in_person') {
          searchRequest.search_zip_code = taskData.zip_code;
        }

        // Fetch helpers (filtered by task zip code if task provided)
        const helpersResponse = await helperApi.searchHelpers(searchRequest);
        const helpersList = helpersResponse.helpers.filter(h => h.zip_code);

        if (helpersList.length === 0) {
          setHelpers([]);
          setLoading(false);
          return;
        }

        // Get unique zip codes
        const zipCodes = Array.from(new Set(helpersList.map(h => h.zip_code!)));

        // Fetch lat/lng for zip codes
        const zipCodeResponse = await taskApi.getZipCodes(zipCodes);
        const zipCodeMap = new Map<string, ZipCodeInfo>(
          zipCodeResponse.result.map(zc => [zc.zip_code, zc])
        );

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

        setHelpers(helpersWithLocations);

        // Group helpers by location (lat/lng)
        const locationMap = new Map<string, LocationGroup>();
        helpersWithLocations.forEach(helper => {
          if (!helper.lat || !helper.lng) return;
          
          const locationKey = `${helper.lat.toFixed(4)}_${helper.lng.toFixed(4)}`;
          
          if (locationMap.has(locationKey)) {
            locationMap.get(locationKey)!.helpers.push(helper);
          } else {
            locationMap.set(locationKey, {
              lat: helper.lat,
              lng: helper.lng,
              zip_code: helper.zip_code,
              city: helper.city,
              state: helper.state,
              helpers: [helper],
            });
          }
        });

        const groups = Array.from(locationMap.values());
        setLocationGroups(groups);

        // Set map center to average of all helper locations, or first helper
        if (groups.length > 0) {
          const avgLat = groups.reduce((sum, g) => sum + g.lat, 0) / groups.length;
          const avgLng = groups.reduce((sum, g) => sum + g.lng, 0) / groups.length;
          setMapCenter([avgLat, avgLng]);
        }
      } catch (err: any) {
        console.error('Failed to load helpers:', err);
        setError(err.message || 'Failed to load helpers');
      } finally {
        setLoading(false);
      }
    };

    loadHelpersWithLocations();
  }, [isAuthenticated, authRoute, taskIdFromUrl]);

  if (!isAuthenticated || authRoute !== 'client') {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as a client to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading helpers map...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Helpers Map View</h1>
          {task ? (
            <div>
              <p className="text-gray-600 mb-2">
                Showing helpers for task: <span className="font-semibold">{task.title}</span>
              </p>
              {task.zip_code && (
                <p className="text-sm text-gray-500">
                  Filtered by location: {task.zip_code} • {helpers.length} helper{helpers.length !== 1 ? 's' : ''} found at {locationGroups.length} location{locationGroups.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              View all available helpers on the map. {helpers.length} helper{helpers.length !== 1 ? 's' : ''} found at {locationGroups.length} location{locationGroups.length !== 1 ? 's' : ''}.
            </p>
          )}
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
            {locationGroups.map((group) => {
              const locationKey = `${group.lat}_${group.lng}`;
              const hasMultiple = group.helpers.length > 1;
              const firstHelper = group.helpers[0];

              // Create custom icon for helper with profile picture and count badge
              const createHelperIcon = (helper: HelperWithLocation, count: number = 1): L.DivIcon => {
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
                  const initials = `${helper.first_name[0]}${helper.last_name[0]}`.toUpperCase();
                  return L.divIcon({
                    className: 'custom-helper-icon',
                    html: `<div style="position: relative; width: 40px; height: 40px;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #3b82f6; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${initials}</div>
                      ${badgeHtml}
                    </div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                    popupAnchor: [0, -20],
                  });
                }
              };

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

        {helpers.length === 0 && (
          <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No helpers found</h3>
            <p className="text-gray-600">No helpers with location data available to display on the map.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;

