import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskUpdate, TaskResponse } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import { validateRequired, validateZipCode } from '../../lib/utils/validation';
import toast from 'react-hot-toast';

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [formData, setFormData] = useState<TaskUpdate>({
    title: '',
    dates: [],
    location_type: 'in-person',
    zip_code: '',
    hourly_rate: 0,
    description: '',
    tools_info: '',
    public_transport_info: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDates, setSelectedDates] = useState<{timestamp: string, display: string}[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/client/signin');
      return;
    }

    if (id) {
      loadTask();
    }
  }, [id, isAuthenticated, navigate]);

  const loadTask = async () => {
    try {
      setLoadingTask(true);
      const taskData = await taskApi.getTask(id!);
      
      // Check if user owns this task
      if (taskData.client_id !== user?.id) {
        toast.error('You can only edit your own tasks');
        navigate('/tasks/my-posts');
        return;
      }

      // Check if task is completed
      if (taskData.completed_at) {
        toast.error('Cannot edit completed tasks');
        navigate('/tasks/my-posts');
        return;
      }

      setTask(taskData);
      
      // Populate form with existing data
      setFormData({
        title: taskData.title,
        dates: taskData.dates,
        location_type: taskData.location_type,
        zip_code: taskData.zip_code || '',
        hourly_rate: taskData.hourly_rate,
        description: taskData.description,
        tools_info: taskData.tools_info || '',
        public_transport_info: taskData.public_transport_info || '',
      });

      // Convert dates to display format
      const dateObjects = taskData.dates.map(date => ({
        timestamp: date,
        display: new Date(date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
      setSelectedDates(dateObjects);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load task');
      navigate('/tasks/my-posts');
    } finally {
      setLoadingTask(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear ZIP code when switching away from in-person
    if (name === 'location_type' && value !== 'in-person') {
      setFormData(prev => ({ ...prev, [name]: value, zip_code: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return;

    const date = new Date(value);
    const timestamp = date.toISOString().split('T')[0];
    const display = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Check if date already exists
    const exists = selectedDates.some(d => d.timestamp === timestamp);
    if (exists) {
      toast.error('This date has already been added');
      return;
    }

    // Add to selected dates
    const newDate = { timestamp, display };
    setSelectedDates(prev => [...prev, newDate]);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      dates: [...prev.dates!, timestamp]
    }));

    // Clear the input
    e.target.value = '';
  };

  const removeDate = (timestamp: string) => {
    setSelectedDates(prev => prev.filter(d => d.timestamp !== timestamp));
    setFormData(prev => ({
      ...prev,
      dates: prev.dates!.filter(d => d !== timestamp)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.title || '')) {
      newErrors.title = 'Title is required';
    }

    if (!validateRequired(formData.description || '')) {
      newErrors.description = 'Description is required';
    }

    if (!formData.dates || formData.dates.length === 0) {
      newErrors.dates = 'At least one date is required';
    }

    if (formData.location_type === 'in-person') {
      if (!validateRequired(formData.zip_code || '')) {
        newErrors.zip_code = 'ZIP code is required for in-person tasks';
      } else if (!validateZipCode(formData.zip_code || '')) {
        newErrors.zip_code = 'Please enter a valid ZIP code';
      }
    }

    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      newErrors.hourly_rate = 'Hourly rate must be greater than 0';
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
      zip_code: formData.location_type === 'in-person' && formData.zip_code ? formData.zip_code : undefined
    };

    setIsLoading(true);

    try {
      await taskApi.updateTask(id!, cleanedFormData);
      toast.success('Task updated successfully!');
      navigate(`/tasks/browse/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingTask) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Task not found</h1>
            <button
              onClick={() => navigate('/tasks/my-posts')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to My Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Task</h1>
          <p className="text-gray-300">Update your task details</p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.title ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                placeholder="What do you need help with?"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Available Dates *
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="date"
                    onChange={handleDateInputChange}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={isLoading}
                  />
                </div>
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30"
                      >
                        <span className="text-sm">{date.display}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(date.timestamp)}
                          className="text-blue-400 hover:text-blue-200 transition-colors"
                          disabled={isLoading}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.dates && (
                <p className="mt-1 text-sm text-red-400">{errors.dates}</p>
              )}
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location Type *
              </label>
              <select
                name="location_type"
                value={formData.location_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white transition-all duration-300 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                disabled={isLoading}
              >
                <option value="in-person">In-Person</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* ZIP Code */}
            {formData.location_type === 'in-person' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                    errors.zip_code ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  placeholder="Enter ZIP code"
                  disabled={isLoading}
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-400">{errors.zip_code}</p>
                )}
              </div>
            )}

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hourly Rate ($) *
              </label>
              <input
                type="number"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.hourly_rate ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                placeholder="Enter hourly rate"
                disabled={isLoading}
              />
              {errors.hourly_rate && (
                <p className="mt-1 text-sm text-red-400">{errors.hourly_rate}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none ${
                  errors.description ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                placeholder="Describe what you need help with in detail..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Tools Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tools/Equipment Required
              </label>
              <textarea
                name="tools_info"
                value={formData.tools_info}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="List any tools or equipment needed..."
                disabled={isLoading}
              />
            </div>

            {/* Public Transport Info */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Public Transportation Info
              </label>
              <textarea
                name="public_transport_info"
                value={formData.public_transport_info}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Provide information about public transportation options..."
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/tasks/browse/${id}`)}
                className="flex-1 px-6 py-3 bg-gray-600/20 text-gray-300 rounded-xl border border-gray-500/30 hover:bg-gray-600/30 hover:text-white transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
