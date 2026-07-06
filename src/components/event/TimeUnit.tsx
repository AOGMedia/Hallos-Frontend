interface TimeUnitProps {
  value: number;
  label: string;
}

export function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="countdown-card min-w-[60px] sm:min-w-[80px]">
      <span className="countdown-number text-2xl sm:text-[32px]">
        {String(value).padStart(2, '0')}
      </span>
      <span className="countdown-label text-[10px] sm:text-[12.8px]">
        {label}
      </span>
    </div>
  );
}