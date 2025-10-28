import React from "react";
import DetailModal from "components/modal/DetailModalNew";
import DateRangePicker from "components/DateRangePicker";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApply: (start: string, end: string) => void;
};

export default function DateRangeModal({ isOpen, onClose, startDate, endDate, onApply }: Props) {
  const [s, setS] = React.useState(startDate);
  const [e, setE] = React.useState(endDate);

  React.useEffect(() => {
    setS(startDate);
    setE(endDate);
  }, [startDate, endDate]);

  return (
    <DetailModal title="Select date range" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <DateRangePicker startDate={s} endDate={e} onStartChange={setS} onEndChange={setE} />
        </div>

        <div className="flex justify-end gap-2">
          <button className="rounded bg-gray-200 px-4 py-2" onClick={() => { setS(""); setE(""); }}>
            Clear
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => {
              onApply(s, e);
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </DetailModal>
  );
}
