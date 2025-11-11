import React, { useState, useEffect, useRef } from 'react';
import collegesData from '../../data/colleges.json';

interface CollegeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const CollegeInput: React.FC<CollegeInputProps> = ({
  value,
  onChange,
  placeholder = "Search for your college...",
  className = "",
  disabled = false,
  error = "",
  label = "",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredColleges, setFilteredColleges] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all college names from the JSON data
  const allColleges = Object.keys(collegesData);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setInputValue(searchTerm);
    
    if (searchTerm.length > 0) {
      // Filter colleges that contain the search term (case-insensitive)
      const filtered = allColleges.filter(college =>
        college.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredColleges(filtered.slice(0, 10)); // Limit to 10 results
      setIsOpen(true);
    } else {
      setFilteredColleges([]);
      setIsOpen(false);
    }
  };

  const handleCollegeSelect = (college: string) => {
    setInputValue(college);
    onChange(college);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      const filtered = allColleges.filter(college =>
        college.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredColleges(filtered.slice(0, 10));
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-800 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 ${
            error 
              ? 'border-red-400 bg-red-500/10' 
              : 'border-white/20 hover:bg-white/15'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        
        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && filteredColleges.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
        >
          {filteredColleges.map((college, index) => (
            <div
              key={index}
              onClick={() => handleCollegeSelect(college)}
              className="px-4 py-3 text-gray-800 hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="font-medium">{college}</div>
              <div className="text-sm text-gray-500">
                {(collegesData as any)[college]}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && filteredColleges.length === 0 && inputValue.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl"
        >
          <div className="px-4 py-3 text-gray-500 text-center">
            No colleges found matching "{inputValue}"
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CollegeInput;
