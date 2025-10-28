import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  className?: string;
};

function toDate(s: string) {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toISODate(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, className = "" }: Props) {
  const start = toDate(startDate);
  const end = toDate(endDate);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-navy-800 px-2 shadow-sm flex items-center gap-2">
        <div>
          <ReactDatePicker
            selected={start}
            onChange={(d: Date | null) => onStartChange(toISODate(d))}
            selectsStart
            startDate={start}
            endDate={end}
            isClearable
            placeholderText="Start date"
            className="text-sm bg-white dark:bg-navy-800 dark:text-white rounded-md border-none outline-none px-2 py-1 placeholder-gray-500 dark:placeholder-gray-400"
            withPortal
          />
        </div>

        <div>
          <ReactDatePicker
            selected={end}
            onChange={(d: Date | null) => onEndChange(toISODate(d))}
            selectsEnd
            startDate={start}
            endDate={end}
            isClearable
            placeholderText="End date"
            className="text-sm bg-white dark:bg-navy-800 dark:text-white rounded-md border-none outline-none px-2 py-1 placeholder-gray-500 dark:placeholder-gray-400"
            withPortal
          />
        </div>

        {(startDate || endDate) ? (
          <button type="button" onClick={() => { onStartChange(""); onEndChange(""); }} title="Clear dates" className="ml-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear</button>
        ) : null}
      </div>
    </div>
  );
}
