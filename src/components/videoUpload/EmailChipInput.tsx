'use client';

import { memo, useState, useCallback, KeyboardEvent, ClipboardEvent } from 'react';
import { X } from 'lucide-react';

interface EmailChipInputProps {
  emails: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  placeholder: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const EmailChipInput = memo(function EmailChipInput({
  emails,
  onAdd,
  onRemove,
  placeholder
}: EmailChipInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const processEmails = useCallback((emailString: string) => {
    const emailList = emailString
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    emailList.forEach(email => {
      if (validateEmail(email)) {
        onAdd(email);
        setError('');
      } else {
        setError(`Invalid email: ${email}`);
      }
    });
  }, [onAdd]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        processEmails(inputValue);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      onRemove(emails[emails.length - 1]);
    }
  }, [inputValue, emails, processEmails, onRemove]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    processEmails(pastedText);
    setInputValue('');
  }, [processEmails]);

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) {
      processEmails(inputValue);
      setInputValue('');
    }
  }, [inputValue, processEmails]);

  return (
    <div className="flex flex-col gap-2">
      <div className="live-event-input flex flex-wrap items-center gap-2 min-h-[48px] ">
        {emails.map((email) => (
          <div
            key={email}
            className="flex items-center gap-1 px-2  bg-primary/20 rounded text-sm text-text-primary"
          >
            <span className='text-xs'>{email}</span>
            <button
              type="button"
              onClick={() => onRemove(email)}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={emails.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[200px] bg-transparent outline-none live-event-input-text"
        />
      </div>
      {error && (
        <span className="text-xs text-accent-red">{error}</span>
      )}
    </div>
  );
});