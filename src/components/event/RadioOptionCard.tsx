interface RadioOptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function RadioOptionCard({ title, description, selected, onClick }: RadioOptionCardProps) {
  return (
    <div
      className={`radio-option-card ${selected ? 'radio-option-card-selected' : ''}`}
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex flex-col gap-1.5">
        <h4 className="role-option-title">{title}</h4>
        <p className="role-option-description text-xs sm:text-sm">{description}</p>
      </div>
      
      <div className={`radio-button ${selected ? 'radio-button-selected' : ''}`}>
        {selected && <div className="radio-button-inner" />}
      </div>
    </div>
  );
}