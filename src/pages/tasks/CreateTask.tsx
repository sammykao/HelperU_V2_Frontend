import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { taskApi, TaskCreate } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import { validateRequired, validateZipCode } from '../../lib/utils/validation';
import toast from 'react-hot-toast';
import { TaskDateSelctor } from '@/components/tasks/TaskDateSelector';
import { formatDateTime } from '@/lib/utils';
import { X } from 'lucide-react';
import type { Page } from '@/lib/utils/types';

type CreateTaskProps = {
  setPage: Dispatch<SetStateAction<Page>>;
}

function CreateTask({ setPage }: CreateTaskProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [dates, setDates] = useState<Date[]>([]);

  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    dates: [],
    location_type: 'in_person',
    zip_code: '',
    description: '',
    tools_info: '',
    public_transport_info: '',
    hourly_rate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle pre-filling form data from URL parameters
  useEffect(() => {
    const title = searchParams.get('title');
    const description = searchParams.get('description');
    const locationType = searchParams.get('location_type');
    const zipCode = searchParams.get('zip_code');
    const toolsInfo = searchParams.get('tools_info');
    const publicTransportInfo = searchParams.get('public_transport_info');
    const hourlyRate = searchParams.get('hourly_rate');

    if (title || description || locationType || zipCode || toolsInfo || publicTransportInfo || hourlyRate) {
      setFormData(prev => ({
        ...prev,
        title: title || prev.title,
        description: description || prev.description,
        location_type: locationType || prev.location_type,
        zip_code: zipCode || prev.zip_code,
        tools_info: toolsInfo || prev.tools_info,
        public_transport_info: publicTransportInfo || prev.public_transport_info,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : prev.hourly_rate,
      }));
    }
  }, [searchParams]);


  if (!isAuthenticated) {
    navigate('/auth/client/signin');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear ZIP code when switching away from in_person
    if (name === 'location_type' && value !== 'in_person') {
      setFormData(prev => ({ ...prev, [name]: value, zip_code: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }

    if (dates.length === 0) {
      newErrors.dates = 'At least one date is required';
    }

    if (!validateRequired(formData.location_type)) {
      newErrors.location_type = 'Location type is required';
    }

    if (formData.location_type === 'in_person' && !validateRequired(formData.zip_code)) {
      newErrors.zip_code = 'ZIP code is required for In Person tasks';
    } else if (formData.zip_code && !validateZipCode(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid 5-digit ZIP code';
    }

    if (formData.hourly_rate == null || formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Hourly rate must be greater than 0';
    }

    if (!validateRequired(formData.description)) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean up the data before sending
    const cleanedFormData = {
      ...formData,
      dates: dates.map((date) => date.toString()),
      zip_code: formData.location_type === 'in_person' && formData.zip_code ? formData.zip_code : undefined
    };

    setIsLoading(true);

    try {
      const resp = await taskApi.createTask(cleanedFormData);
      toast.success('Task created successfully!');
      navigate('/tasks/browse/' + resp.id);
    } catch (err: any) {
      // Check if the error is due to post limit reached
      if (err.message && err.message.includes('post limit')) {
        toast.error('You have reached your post limit. Please upgrade your plan to create more tasks.');
        navigate('/subscription/upgrade');
      } else {
        toast.error(err.message || 'Failed to create task');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
          <p className="text-gray-700">Post an opportunity for students to help with</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 ${errors.title ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                placeholder="What do you need help with?"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Available Dates *
              </label>

              <div className="mb-2 grid grid-cols-2 justify-center items-start w-full px-4">
                <div className="flex items-center justify-center">
                  <TaskDateSelctor dates={dates} setDates={setDates} />
                </div>

                {/* Scrollable date list */}
                <div className="flex flex-col p-4 gap-y-2 overflow-y-auto h-[290px] rounded-md bg-white shadow-sm">
                  <span className="mb-2 font-medium text-gray-700">Your Selected Dates</span>

                  <div className="flex flex-col gap-y-2">
                    {dates.map((date) => (
                      <span
                        key={date.toString()}
                        className="inline-flex items-center justify-between px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200"
                      >
                        {formatDateTime(date.toString()).split(",")[0]} {formatDateTime(date.toString()).split(",")[1]}
                        <button
                          type="button"
                          onClick={() => {
                            setDates((prev) => prev.filter((d) => d !== date));
                          }}
                          className="ml-2 text-blue-700 hover:text-blue-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {errors.dates && (
                <p className="mt-1 text-sm text-red-400">{errors.dates}</p>
              )}
            </div>

            {/* Location and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location Type *
                </label>
                <select
                  name="location_type"
                  value={formData.location_type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 bg-white border rounded-xl text-gray-900 transition-all duration-300 appearance-none cursor-pointer ${errors.location_type ? 'border-red-400' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em'
                  }}
                  disabled={isLoading}
                >
                  <option value="in_person" className="bg-white text-gray-900">In-Person</option>
                  <option value="remote" className="bg-white text-gray-900">Remote</option>
                </select>
                {errors.location_type && (
                  <p className="mt-1 text-sm text-red-400">{errors.location_type}</p>
                )}
              </div>

              {formData.location_type === 'in_person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    maxLength={5}
                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 ${errors.zip_code ? 'border-red-400' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                    placeholder="02138"
                    disabled={isLoading}
                  />
                  {errors.zip_code && (
                    <p className="mt-1 text-sm text-red-400">{errors.zip_code}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Hourly Rate ($) *
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate ?? ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 ${errors.hourly_rate ? 'border-red-400' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="25.00"
                  disabled={isLoading}
                />
                {errors.hourly_rate && (
                  <p className="mt-1 text-sm text-red-400">{errors.hourly_rate}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                placeholder="Describe what you need help with, what skills are required, and any other important details..."
                disabled={isLoading}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-400">{errors.description}</p>
                )}
                <p className="text-sm text-gray-600 ml-auto">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Tools Info */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Any Tools/Equipment Needed? (Optional)
              </label>
              <textarea
                name="tools_info"
                value={formData.tools_info}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="List any tools, equipment, or software the helper will need..."
                disabled={isLoading}
              />
            </div>

            {/* Public Transport Info */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Public Transportation Info (Optional)
              </label>
              <textarea
                name="public_transport_info"
                value={formData.public_transport_info}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Provide information about nearby public transportation options..."
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setPage('myPosts')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-200 transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Post...
                  </div>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
