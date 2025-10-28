import { useState } from "react";
import Calendar from "react-calendar";
import Card from "components/card";
import "react-calendar/dist/Calendar.css";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "assets/css/MiniCalendar.css";

// Local value type matching react-calendar's `value` prop: single Date or a tuple range
type CalendarValue = Date | null | [Date | null, Date | null];

const MiniCalendar = () => {
  const [value, setValue] = useState<CalendarValue>(new Date());
  // Adapter to match the possible onChange signatures from react-calendar
  const handleChange = (v: Date | [Date | null, Date | null], event?: any) => {
    setValue(v as CalendarValue);
  };

  return (
    <div>
      <Card extra="flex w-full h-full flex-col px-3 py-3">
        <Calendar
          onChange={handleChange}
          value={value}
          prevLabel={<MdChevronLeft className="ml-1 h-6 w-6 " />}
          nextLabel={<MdChevronRight className="ml-1 h-6 w-6 " />}
          view={"month"}
        />
      </Card>
    </div>
  );
};

export default MiniCalendar;
