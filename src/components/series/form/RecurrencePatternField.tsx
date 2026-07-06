interface RecurrencePatternFieldProps {
  selectedDays: string[];
  startTime: string;
  duration: string;
  onDaysChange: (days: string[]) => void;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: string) => void;
  errors?: {
    days?: string;
    startTime?: string;
    duration?: string;
  };
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export function RecurrencePatternField({
  selectedDays,
  startTime,
  duration,
  onDaysChange,
  onStartTimeChange,
  onDurationChange,
  errors
}: RecurrencePatternFieldProps) {
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  // Validate time format (HH:MM)
  const validateTime = () => {
    if (startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime)) {
      return 'Invalid time format. Use HH:MM (24-hour format)';
    }
    return null;
  };

  // Validate duration
  const validateDuration = () => {
    const durationNum = parseInt(duration);
    if (duration && (isNaN(durationNum) || durationNum <= 0)) {
      return 'Duration must be a positive number';
    }
    return null;
  };

  const timeError = errors?.startTime || validateTime();
  const durationError = errors?.duration || validateDuration();
  const daysError = errors?.days || (selectedDays.length === 0 && 'Select at least one day, one of the days must match start date');

  return (
    <div className="flex flex-col gap-4">
      <label className="live-event-label">Recurrence Pattern</label>
      <p className="live-event-helper-text">
        Define when your sessions will occur. Select the days of the week, start time, and duration for each session.
      </p>

      {/* Days of Week Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-primary/70">Days of Week</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                selectedDays.includes(day.value)
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border/20 bg-background-dark text-text-primary/70 hover:border-border/40'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {daysError && selectedDays.length === 0 && (
          <div className="text-sm text-red-400 mt-1">
            {daysError}
          </div>
        )}
      </div>

      {/* Start Time and Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-primary/70">Session Start Time</label>
          <div className="live-event-input">
            <input
              type={startTime ? 'time' : 'text'}
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              onFocus={(e) => {
                if (e.target.type === 'text') {
                  e.target.type = 'time';
                }
              }}
              placeholder="HH:MM"
              className="w-full bg-transparent outline-none live-event-input-text"
            />
          </div>
          {timeError && (
            <div className="text-sm text-red-400 mt-1">
              {timeError}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-text-primary/70">Duration (minutes)</label>
          <div className="live-event-input">
            <input
              type="number"
              value={duration}
              onChange={(e) => onDurationChange(e.target.value)}
              placeholder="e.g., 60"
              min="1"
              className="w-full bg-transparent outline-none live-event-input-text"
            />
          </div>
          {durationError && (
            <div className="text-sm text-red-400 mt-1">
              {durationError}
            </div>
          )}
        </div>
      </div>

      {/* Helper text for duration */}
      <p className="text-xs text-text-primary/50">
        Common durations: 30 min, 60 min (1 hour), 90 min (1.5 hours), 120 min (2 hours)
      </p>
    </div>
  );
}
