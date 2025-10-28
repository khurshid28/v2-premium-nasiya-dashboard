import React from "react";

interface CustomFileInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  value?: string; // base64 image for preview
  placeholder?: string;
  className?: string;
}

const CustomFileInput: React.FC<CustomFileInputProps> = ({
  onChange,
  accept = "image/*",
  value,
  placeholder = "Choose file",
  className = ""
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const syntheticEvent = {
        target: { files }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:border-gray-400 hover:bg-gray-100 transition-colors"
      >
        {value ? (
          <div className="space-y-2">
            <img
              src={value}
              alt="Preview"
              className="mx-auto h-16 w-16 rounded-lg object-cover border"
            />
            <div className="text-sm text-gray-600">Click to change image</div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {" or drag and drop"}
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFileInput;