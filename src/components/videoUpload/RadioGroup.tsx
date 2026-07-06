'use client';

import clsx from "clsx";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  radioStyle?:string;
  radioContainerStyle?:string;
}

export function RadioGroup({ options, value, onChange, name ,radioStyle, radioContainerStyle}: RadioGroupProps) {
  return (
    <div className={clsx("flex gap-4 ", radioContainerStyle)}>
      {options.map((option) => (
        <label
          key={option.value}
          className={clsx( "radio-option-card flex-1 cursor-pointer ",radioStyle)}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
          <span className="text-regular text-text-primary">{option.label}</span>
          <div className={`radio-button ${value === option.value ? 'radio-button-selected' : ''}`}>
            {value === option.value && <div className="radio-button-inner" />}
          </div>
        </label>
      ))}
    </div>
  );
}