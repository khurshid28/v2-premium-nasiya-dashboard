import React from "react";

type Props = {
  value?: string; // raw digits (up to 9)
  onChange: (digits: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};



export default function PhoneInput({ value = "", onChange, placeholder, className = "", id }: Props) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 9);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDigits = String(e.target.value || "").replace(/\D/g, "").slice(0, 9);
    onChange(newDigits);
  };
  return (
    <div className={"inline-flex flex-col " + className}>
      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-200 transition">
        <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 rounded-l-lg">+998</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={digits}
          onChange={handleChange}
          placeholder={placeholder ?? "901234567"}
          maxLength={9}
          className="flex-1 px-3 py-2 text-sm rounded-r-lg focus:outline-none"
          aria-label="phone-local"
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">Enter 9 digits (e.g. 90 123 45 67)</div>
    </div>
  );
}
