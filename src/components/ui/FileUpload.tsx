import React, { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../lib/contexts/AuthContext';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUpload: (url: string) => void;
  currentUrl?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  variant?: 'preview' | 'button' | 'icon';
  buttonLabel?: string;
}

// Supabase configuration - these should be in your environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUpload,
  currentUrl,
  accept = 'image/*',
  maxSize = 5,
  disabled = false,
  variant = 'preview',
  buttonLabel = 'Change photo',
}) => {
  const { token } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create authenticated Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    },
  });

  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback to original
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type first
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    try {
      // Compress image for profile pictures
      const compressedFile = await compressImage(file, 400, 0.8);
      
      // Validate compressed file size
      if (compressedFile.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }

      console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);


      onFileSelect(compressedFile);
      await uploadFile(compressedFile);
    } catch (error) {
      setError('Failed to process image');
      console.error('Image compression error:', error);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to Supabase Storage      
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      


      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
      

      setUploadProgress(100);
      onUpload(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          aria-label={isUploading ? `Uploading ${uploadProgress}%` : 'Change photo'}
          className={`w-9 h-9 rounded-full border border-white/30 shadow-lg flex items-center justify-center transition-colors ${
            disabled || isUploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h2l1-2h6l1 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          )}
        </button>
      ) : variant === 'button' ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
            disabled || isUploading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600/90 hover:bg-indigo-600 text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h2l1-2h6l1 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
          {isUploading ? `Uploading... ${uploadProgress}%` : buttonLabel}
        </button>
      ) : currentUrl ? (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={currentUrl}
              alt="Profile preview"
              className="w-24 h-24 rounded-xl object-cover border border-white/20"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-400">Click to change photo</p>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${disabled || isUploading 
              ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed' 
              : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50'
            }
          `}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-300">
                Click to upload photo
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max {maxSize}MB, {accept}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
