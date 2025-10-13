import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  disabled = false,
  error,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;

    // Only allow single digit input
    const sanitizedValue = value.replace(/\D/g, '').slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = sanitizedValue;
    setOtp(newOtp);

    // Move to next input if current input has a value
    if (sanitizedValue && index < length - 1) {
      setActiveIndex(index + 1);
    }

    // Check if all inputs are filled
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
    } else if (e.key === 'Delete') {
      // Handle Delete key (similar to Backspace)
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === length) {
      const newOtp = pastedData.split('').slice(0, length);
      setOtp(newOtp);
      setActiveIndex(length - 1);
      onComplete(pastedData);
    }
  };

  // Handle iPhone keyboard "Done" button and prevent form submission
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent Enter key from submitting forms
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  };

  // Handle click/tap to focus and select all text
  const handleClick = (index: number) => {
    if (disabled) return;
    setActiveIndex(index);
    // Select all text when clicking on an input with content
    setTimeout(() => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]?.select();
      }
    }, 0);
  };

  return (
    <div className="w-full">
      <div className="flex justify-center gap-2 sm:gap-3 mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            onFocus={() => setActiveIndex(index)}
            onClick={() => handleClick(index)}
            disabled={disabled}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold
              bg-white/10 border rounded-xl
              text-gray-700 placeholder-gray-400
              transition-all duration-300
              ${activeIndex === index ? 'border-blue-400 bg-white/20' : 'border-gray-700'}
              ${error ? 'border-red-400 bg-red-500/10' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15'}
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              touch-manipulation select-text
              min-w-0 flex-shrink-0
            `}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};
