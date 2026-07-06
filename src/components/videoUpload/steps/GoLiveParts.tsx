import React from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { ToggleSwitch } from '../ToggleSwitch'
import { EmailChipInput } from '../EmailChipInput'
import { CurrencySelect } from '../CurrencySelect'
import { LiveEventThumbnailUpload } from '../LiveEventThumbnailUpload'
import LinkIcon from '@/components/icons/LinkIcon'

interface TitleFieldProps {
  value: string
  onChange: (v: string) => void
}

export function TitleField({ value, onChange }: TitleFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Title</label>
      <div className="live-event-input">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="E.g Digital market Class"
          className="w-full bg-transparent outline-none live-event-input-text"
        />
      </div>
    </div>
  )
}

interface DescriptionFieldProps {
  value: string
  onChange: (v: string) => void
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Description</label>
      <div className="live-event-input">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter description for your live class"
          className="w-full bg-transparent outline-none live-event-input-text min-h-[80px] resize-y"
        />
      </div>
    </div>
  )
}

import { CurrencyCode } from '@/types/videoUpload'

interface PriceFieldProps {
  currency: CurrencyCode
  onCurrencyChange: (v: CurrencyCode) => void
  price: string
  onPriceChange: (v: string) => void
}

export function PriceField({ currency, onCurrencyChange, price, onPriceChange }: PriceFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  // Format number with commas and decimals for display (only when not focused)
  const formatNumberWithCommas = (value: string): string => {
    // If empty, return empty string
    if (!value) return '';
    
    // Parse the number
    const numValue = parseFloat(value);
    
    // If not a valid number, return empty
    if (isNaN(numValue)) return '';
    
    // Format with commas and 2 decimal places
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      onPriceChange('');
      return;
    }
    
    // Remove commas for validation
    const rawValue = inputValue.replace(/,/g, '');
    
    // Allow digits, single decimal point, and up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(rawValue)) {
      onPriceChange(rawValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Format on blur to ensure proper decimal places
    if (price) {
      const numValue = parseFloat(price);
      if (!isNaN(numValue)) {
        // Store with 2 decimal places
        onPriceChange(numValue.toFixed(2));
      }
    }
  };

  // Show raw value when focused (for easy editing), formatted when not focused
  const displayValue = isFocused ? price : (price ? formatNumberWithCommas(price) : '');

  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Price</label>
      <div className="live-event-input flex items-center gap-2">
        <CurrencySelect value={currency} onChange={onCurrencyChange} />
        <input
          type="text"
          value={displayValue}
          onChange={handlePriceChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Set price for this event"
          className="flex-1 bg-transparent outline-none live-event-input-text"
        />
      </div>
    </div>
  )
}

interface ToggleScheduleProps {
  checked: boolean
  onChange: (v: boolean) => void
}

export function ToggleSchedule({ checked, onChange }: ToggleScheduleProps) {
  return <ToggleSwitch checked={checked} onChange={onChange} label="Schedule Class" />
}

interface PrivacyFieldProps {
  value: 'public' | 'private'
  onChange: (v: 'public' | 'private') => void
}

export function PrivacyField({ value, onChange }: PrivacyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Privacy</label>
      <div className="live-event-input">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as 'public' | 'private')}
          className="w-full bg-transparent outline-none live-event-input-text cursor-pointer"
        >
          <option className="bg-[#1F2636] text-white" value="public">Public</option>
          <option className="bg-[#1F2636] text-white" value="private">Private</option>
        </select>
      </div>
    </div>
  )
}

interface StreamingProviderFieldProps {
  value: 'mux' | 'zegocloud'
  onChange: (v: 'mux' | 'zegocloud') => void
}

export function StreamingProviderField({ value, onChange }: StreamingProviderFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="live-event-label">Streaming Method</label>
      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => onChange('zegocloud')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            value === 'zegocloud'
              ? 'border-primary bg-primary/10'
              : 'border-border/20 bg-background-dark hover:border-border/40 shadow-2xl'
          }`}
        >
          <div className="font-semibold text-text-primary mb-1">Stream In-App   (Recommended)</div>
          <div className="text-sm text-text-primary/70">Stream directly from Hallos .</div>
        </button>
        {/* <button
          type="button"
          onClick={() => onChange('mux')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            value === 'mux'
              ? 'border-primary bg-primary/10'
              : 'border-border/20 bg-background-dark hover:border-border/40 shadow-2xl'
          }`}
        >
          <div className="font-semibold text-text-primary mb-1">Stream with OBS or Others</div>
          <div className="text-sm text-text-primary/70">Use OBS or external streaming software (Stream Prerecorded classes etc).</div>
        </button> */}
      </div>
    </div>
  )
}

interface CategoryFieldProps {
  value: string
  onChange: (v: string) => void
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Category</label>
      <div className="live-event-input">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none live-event-input-text cursor-pointer"
        >
          <option className="bg-[#1F2636] text-white" value="">Select Category</option>
          <option className="bg-[#1F2636] text-white" value="Entertainment">Entertainment</option>
          <option className="bg-[#1F2636] text-white" value="Education">Education</option>
          <option className="bg-[#1F2636] text-white" value="Technology">Technology</option>
          <option className="bg-[#1F2636] text-white" value="Science">Science</option>
          <option className="bg-[#1F2636] text-white" value="Programming">Programming</option>
          <option className="bg-[#1F2636] text-white" value="Graphics Design">Graphics Design</option>
          <option className="bg-[#1F2636] text-white" value="Data Analysis">Data Analysis</option>
        </select>
      </div>
    </div>
  )
}

interface MaxParticipantsFieldProps {
  value: string
  onChange: (v: string) => void
  streamingProvider: 'mux' | 'zegocloud'
}

export function MaxParticipantsField({ value, onChange, streamingProvider }: MaxParticipantsFieldProps) {
  if (streamingProvider !== 'zegocloud') return null
  
  return (
    <div className="flex flex-col gap-1">
      <label className="live-event-label">Max Participants</label>
      <div className="live-event-input">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="50"
          className="w-full bg-transparent outline-none live-event-input-text"
        />
      </div>
    </div>
  )
}

interface DateFieldProps {
  date: string
  onChange: (v: string) => void
}

function DateField({ date, onChange }: DateFieldProps) {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="live-event-input relative">
      <input
        type={date ? 'date' : 'text'}
        value={date}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          if (e.target.type === 'text') {
            e.target.type = 'date'
          }
        }}
        min={today}
        placeholder="Date"
        className="w-full bg-transparent outline-none live-event-input-text"
      />
    </div>
  )
}

interface TimeFieldProps {
  value: string
  onChange: (v: string) => void
  active: boolean
  placeholder: string
}

function TimeField({ value, onChange, active, placeholder }: TimeFieldProps) {
  return (
    <div className="flex-1 live-event-input">
      <input
        type={active ? 'time' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          if (e.target.type === 'text') {
            e.target.type = 'time'
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none live-event-input-text"
      />
    </div>
  )
}

interface ScheduleFieldsProps {
  date: string
  onDateChange: (v: string) => void
  startTime: string
  onStartTimeChange: (v: string) => void
  endTime: string
  onEndTimeChange: (v: string) => void
}

export function ScheduleFields({ date, onDateChange, startTime, onStartTimeChange, endTime, onEndTimeChange }: ScheduleFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="live-event-label">Schedule Option</label>
      <DateField date={date} onChange={onDateChange} />
      <div className="flex gap-4">
        <TimeField value={startTime} onChange={onStartTimeChange} active={!!endTime} placeholder="Start Time" />
        <span className="live-event-input-text self-center">To</span>
        <TimeField value={endTime} onChange={onEndTimeChange} active={!!endTime} placeholder="End Time" />
      </div>
    </div>
  )
}

interface ThumbnailSectionProps {
  file: File | null
  preview: string | null
  onFileSelect: (file: File, preview: string) => void
}

export function ThumbnailSection({ file, preview, onFileSelect }: ThumbnailSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="live-event-label">Upload thumbnail</label>
      <p className="live-event-helper-text">16:9 ratio dimension is advised. A good thumbnail stands out and draws viewers&apos; attention</p>
      <LiveEventThumbnailUpload file={file} preview={preview} onFileSelect={onFileSelect} />
    </div>
  )
}

interface InviteSectionProps {
  title: string
  emails: string[]
  onAdd: (email: string) => void
  onRemove: (email: string) => void
  copied: boolean
  onCopy: () => void
}

export function InviteSection({ title, emails, onAdd, onRemove, copied, onCopy }: InviteSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="live-event-input-text">{title}</span>
        <button type="button" onClick={onCopy} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <LinkIcon width={18} height={10} color="#6a57e5" />
          <span className="live-event-link-text">{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
      <EmailChipInput emails={emails} onAdd={onAdd} onRemove={onRemove} placeholder="Add comma separated emails to invite" />
    </div>
  )
}

interface HostHeaderProps {
  name: string
  avatar: string
}

export function HostHeader({ name, avatar }: HostHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="live-event-input-text">Host ({name})</span>
      <Avatar src={avatar} alt={name} size="md" />
    </div>
  )
}
