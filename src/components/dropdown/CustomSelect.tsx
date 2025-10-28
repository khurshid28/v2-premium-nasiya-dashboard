import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 text-left bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-lg shadow-sm hover:border-gray-300 dark:hover:border-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <IoChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value)}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                option.value === value
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;