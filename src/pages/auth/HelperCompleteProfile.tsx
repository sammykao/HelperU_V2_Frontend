import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, HelperProfileUpdateRequest } from '../../lib/api/auth';
import { validateRequired, validateZipCode, validateRange } from '../../lib/utils/validation';
import { useAuth } from '../../lib/contexts/AuthContext';
import { FileUpload } from '../../components/ui/FileUpload';
import CollegeInput from '../../components/ui/CollegeInput';
import toast from 'react-hot-toast';

const HelperCompleteProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profileStatus, refreshProfileStatus } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    college: '',
    bio: '',
    graduation_year: new Date().getFullYear() + 1,
    zip_code: '',
    pfp_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if profile is already complete
    if (profileStatus?.profile_completed) {
      navigate('/tasks/browse');
    }
  }, [profileStatus, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileUpload = (url: string) => {
    setFormData(prev => ({ ...prev, pfp_url: url }));
    setSelectedFile(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequired(formData.first_name)) {
      newErrors.first_name = 'First name is required';
    }

    if (!validateRequired(formData.last_name)) {
      newErrors.last_name = 'Last name is required';
    }

    if (!validateRequired(formData.college)) {
      newErrors.college = 'College is required';
    }

    if (!validateRequired(formData.bio)) {
      newErrors.bio = 'Bio is required';
    } else if (formData.bio.length < 10) {
      newErrors.bio = 'Bio must be at least 10 characters';
    } else if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be no more than 500 characters';
    }

    if (!validateRange(formData.graduation_year, 2020, 2030)) {
      newErrors.graduation_year = 'Graduation year must be between 2020 and 2030';
    }

    if (!validateRequired(formData.zip_code)) {
      newErrors.zip_code = 'ZIP code is required';
    } else if (!validateZipCode(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid 5-digit ZIP code';
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
      const request: HelperProfileUpdateRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        college: formData.college,
        bio: formData.bio,
        graduation_year: formData.graduation_year,
        zip_code: formData.zip_code,
        pfp_url: formData.pfp_url || undefined,
      };

      await authApi.helperCompleteProfile(request);
      toast.success('Profile completed successfully!');
      await refreshProfileStatus();
      navigate('/tasks/browse');
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      {/* Background Effects (subtle) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/40 rounded-full mix-blend-multiply blur-2xl opacity-70 animate-pulse-blue"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200/40 rounded-full mix-blend-multiply blur-2xl opacity-70 animate-pulse-blue animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md mb-2">
            HelperU
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete Your Helper Profile</h2>
          <p className="text-gray-600">Tell us about yourself to help clients find you</p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    errors.first_name ? 'border-red-400' : 'border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="John"
                  disabled={isLoading}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    errors.last_name ? 'border-red-400' : 'border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="Doe"
                  disabled={isLoading}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <CollegeInput
                value={formData.college}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, college: value }));
                  if (errors.college) {
                    setErrors(prev => ({ ...prev, college: '' }));
                  }
                }}
                placeholder="Search for your college..."
                label="College/University"
                required
                error={errors.college}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none ${
                  errors.bio ? 'border-red-400' : 'border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                placeholder="Tell clients about your skills, experience, and what makes you a great helper..."
                disabled={isLoading}
              />
              <div className="flex justify-between mt-1">
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="text-sm text-gray-700 ml-auto">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduation_year"
                  value={formData.graduation_year}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    errors.graduation_year ? 'border-red-400' : 'border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  disabled={isLoading}
                />
                {errors.graduation_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.graduation_year}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  maxLength={5}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                    errors.zip_code ? 'border-red-400' : 'border-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/30`}
                  placeholder="02138"
                  disabled={isLoading}
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Profile Picture (Optional)
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                onUpload={handleFileUpload}
                currentUrl={formData.pfp_url}
                disabled={isLoading}
                accept="image/*"
                maxSize={5}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Completing Profile...
                </div>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelperCompleteProfile;
