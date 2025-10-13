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

    // Handle iPhone automatic OTP detection - if multiple digits are entered at once
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, length);
      const newOtp = [...otp];
      
      // Fill the inputs starting from the current index
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Move to the last filled input or the last input
      const lastFilledIndex = Math.min(index + digits.length - 1, length - 1);
      setActiveIndex(lastFilledIndex);
      
      // Check if all inputs are filled
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }

    // Only allow single digit input for manual entry
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
    
    if (pastedData.length > 0) {
      const digits = pastedData.split('').slice(0, length);
      const newOtp = [...otp];
      
      // Fill the inputs starting from the current active index
      digits.forEach((digit, i) => {
        if (activeIndex + i < length) {
          newOtp[activeIndex + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Move to the last filled input or the last input
      const lastFilledIndex = Math.min(activeIndex + digits.length - 1, length - 1);
      setActiveIndex(lastFilledIndex);
      
      // Check if all inputs are filled
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
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

  // Handle input event for better mobile compatibility (especially iPhone)
  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const target = e.target as HTMLInputElement;
    const value = target.value;
    
    // Handle iPhone automatic OTP detection
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, length);
      const newOtp = [...otp];
      
      // Fill the inputs starting from the current index
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Move to the last filled input or the last input
      const lastFilledIndex = Math.min(index + digits.length - 1, length - 1);
      setActiveIndex(lastFilledIndex);
      
      // Check if all inputs are filled
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
      return;
    }
    
    // Handle single digit input
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

  return (
    <div className="w-full">
      {/* Hidden input for iPhone automatic OTP detection */}
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none'
        }}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '');
          if (value.length === length) {
            const digits = value.split('');
            setOtp(digits);
            setActiveIndex(length - 1);
            onComplete(value);
          }
        }}
      />
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
            onInput={(e) => handleInput(index, e)}
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
