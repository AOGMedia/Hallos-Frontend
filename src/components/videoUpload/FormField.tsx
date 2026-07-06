'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, description, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-regular text-text-primary">
        {label}
        {required && <span className="text-accent-red ml-1">*</span>}
      </label>
      {description && (
        <p className="text-description text-sm">{description}</p>
      )}
      {children}
    </div>
  );
}

// interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}
type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className = '', ...props }: TextInputProps) {
  return (
    <input
      className={`auth-input w-full ${className}`}
      {...props}
    />
  );
}

// interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}
type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;


export function TextArea({ className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`auth-input w-full min-h-[100px] resize-y ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`auth-input w-full cursor-pointer ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option className='bg-black' key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}