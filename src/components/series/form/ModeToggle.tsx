interface ModeToggleProps {
  mode: 'single' | 'series';
  onModeChange: (mode: 'single' | 'series') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <label className="live-event-label">Class Type</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onModeChange('single')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            mode === 'single'
              ? 'border-primary bg-primary/10'
              : 'border-border/20 bg-background-dark hover:border-border/40'
          }`}
        >
          <div className="font-semibold text-text-primary mb-1">Single Class</div>
          <div className="text-sm text-text-primary/70">
            Create a one-time live class
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onModeChange('series')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            mode === 'series'
              ? 'border-primary bg-primary/10'
              : 'border-border/20 bg-background-dark hover:border-border/40'
          }`}
        >
          <div className="font-semibold text-text-primary mb-1">Series</div>
          <div className="text-sm text-text-primary/70">
            Create recurring live classes
          </div>
        </button>
      </div>
    </div>
  );
}
