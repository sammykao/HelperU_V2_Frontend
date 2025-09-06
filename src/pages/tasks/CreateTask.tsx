import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { taskApi, TaskCreate } from '../../lib/api/tasks';
import { useAuth } from '../../lib/contexts/AuthContext';
import { validateRequired, validateZipCode } from '../../lib/utils/validation';
import toast from 'react-hot-toast';

const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<TaskCreate>({
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  if (!isAuthenticated) {
    navigate('/auth/client/signin');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateAdd = () => {
    const dateInput = document.getElementById('date-input') as HTMLInputElement;
    if (dateInput.value && !selectedDates.includes(dateInput.value)) {
      setSelectedDates(prev => [...prev, dateInput.value].sort());
      setFormData(prev => ({ ...prev, dates: [...prev.dates, dateInput.value].sort() }));
      dateInput.value = '';
    }
  };

  const handleDateRemove = (dateToRemove: string) => {
    setSelectedDates(prev => prev.filter(date => date !== dateToRemove));
    setFormData(prev => ({ ...prev, dates: prev.dates.filter(date => date !== dateToRemove) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }

    if (formData.dates.length === 0) {
      newErrors.dates = 'At least one date is required';
    }

    if (!validateRequired(formData.location_type)) {
      newErrors.location_type = 'Location type is required';
    }

    if (formData.location_type === 'in-person' && !validateRequired(formData.zip_code)) {
      newErrors.zip_code = 'ZIP code is required for in-person tasks';
    } else if (formData.zip_code && !validateZipCode(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid 5-digit ZIP code';
    }

    if (formData.hourly_rate <= 0) {
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

    setIsLoading(true);

    try {
      await taskApi.createTask(formData);
      toast.success('Task created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Post</h1>
          <p className="text-gray-300">Post an opportunity for students to help with</p>
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
              <div className="flex space-x-2 mb-2">
                <input
                  id="date-input"
                  type="date"
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  min={new Date().toISOString().split('T')[0]}
                />
                <button
                  type="button"
                  onClick={handleDateAdd}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Add Date
                </button>
              </div>
              {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm"
                    >
                      {new Date(date).toLocaleDateString()}
                      <button
                        type="button"
                        onClick={() => handleDateRemove(date)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.dates && (
                <p className="mt-1 text-sm text-red-400">{errors.dates}</p>
              )}
            </div>

            {/* Location and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location Type *
                </label>
                <select
                  name="location_type"
                  value={formData.location_type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white transition-all duration-300 ${
                    errors.location_type ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  disabled={isLoading}
                >
                  <option value="in-person">In-Person</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.location_type && (
                  <p className="mt-1 text-sm text-red-400">{errors.location_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code {formData.location_type === 'in-person' ? '*' : ''}
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  maxLength={5}
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                    errors.zip_code ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                  placeholder="02138"
                  disabled={isLoading}
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-400">{errors.zip_code}</p>
                )}
              </div>

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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none ${
                  errors.description ? 'border-red-400 bg-red-500/10' : 'border-white/20 hover:bg-white/15'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                placeholder="Describe what you need help with, what skills are required, and any other important details..."
                disabled={isLoading}
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-400">{errors.description}</p>
                )}
                <p className="text-sm text-gray-400 ml-auto">
                  {formData.description.length}/2000 characters
                </p>
              </div>
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
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="List any tools, equipment, or software the helper will need..."
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
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 transition-all duration-300 resize-none hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="Provide information about nearby public transportation options..."
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
