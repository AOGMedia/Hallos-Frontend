interface SeriesDateRangeFieldProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  error?: string;
}

export function SeriesDateRangeField({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error
}: SeriesDateRangeFieldProps) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  // Validate that end date is after start date
  const validateDates = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return 'End date must be after start date';
      }
    }
    return null;
  };

  const validationError = error || validateDates();

  return (
    <div className="flex flex-col gap-4">
      <label className="live-event-label">Series Date Range</label>
      <p className="live-event-helper-text">
        Select the start and end dates for your series. Sessions will be generated based on your recurrence pattern within this date range.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-primary/70">Series Start Date</label>
          <div className="live-event-input">
            <input
              type={startDate ? 'date' : 'text'}
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              onFocus={(e) => {
                if (e.target.type === 'text') {
                  e.target.type = 'date';
                }
              }}
              min={today}
              placeholder="Start Date"
              className="w-full bg-transparent outline-none live-event-input-text"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-primary/70">Series End Date</label>
          <div className="live-event-input">
            <input
              type={endDate ? 'date' : 'text'}
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              onFocus={(e) => {
                if (e.target.type === 'text') {
                  e.target.type = 'date';
                }
              }}
              min={startDate || today}
              placeholder="End Date"
              className="w-full bg-transparent outline-none live-event-input-text"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {validationError && (
        <div className="text-sm text-red-400 mt-1">
          {validationError}
        </div>
      )}
    </div>
  );
}
