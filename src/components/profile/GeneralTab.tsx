'use client';

import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';
import { FormSelect } from './FormSelect';
import { ToggleSwitch } from '@/components/videoUpload/ToggleSwitch';

interface GeneralTabProps {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  location: string;
  gender: string;
  newsletterSubscribed: boolean;
  isEditing: boolean;
  onFieldChange: (field: string, value: string) => void;
  onNewsletterChange: (subscribed: boolean) => void;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function GeneralTab({
  firstName,
  lastName,
  displayName,
  email,
  phoneNumber,
  bio,
  location,
  gender,
  newsletterSubscribed,
  isEditing,
  onFieldChange,
  onNewsletterChange,
}: GeneralTabProps) {
  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            value={`${firstName} ${lastName}`.trim()}
            onChange={(e) => {
              const parts = e.target.value.split(' ');
              onFieldChange('firstName', parts[0] || '');
              onFieldChange('lastName', parts.slice(1).join(' ') || '');
            }}
            placeholder="Enter your full name"
            readOnly={!isEditing}
          />
          <FormInput
            label="Display name"
            value={displayName}
            onChange={(e) => onFieldChange('displayName', e.target.value)}
            placeholder="@username"
            readOnly={!isEditing}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder="Enter email address"
            readOnly={true}
          />
          <FormInput
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => onFieldChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            readOnly={!isEditing}
          />
        </div>

        <FormTextarea
          label="Bio"
          rows={3}
          value={bio}
          onChange={(e) => onFieldChange('bio', e.target.value)}
          placeholder="Digital Marketer, Entrepreneur, Economist and online tutor"
          readOnly={!isEditing}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Location"
            value={location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="e.g., Lagos, Nigeria"
            readOnly={!isEditing}
          />
          <FormSelect
            label="Gender"
            value={gender}
            onChange={(e) => onFieldChange('gender', e.target.value)}
            options={GENDER_OPTIONS}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="border-t border-border/20 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-text-primary mb-1">Newsletter Subscription</h3>
            <p className={`text-sm ${newsletterSubscribed ? 'text-primary' : 'text-text-muted'}`}>
              {newsletterSubscribed ? 'Subscribed' : 'Not subscribed'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Receive updates, tips, and exclusive content via email
            </p>
          </div>
          <ToggleSwitch 
            checked={newsletterSubscribed} 
            onChange={onNewsletterChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* ID Verification Section */}
      {/* <div className="border-t border-border/20 pt-6">
        <h3 className="text-base font-medium text-text-primary mb-4">ID Verification</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 border-2 border-primary/30 rounded-lg bg-primary/5">
            <span className="text-yellow-500 font-medium">Not Verified</span>
          </div>
          <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-sm">
            Verify Now →
          </button>
        </div>
      </div> */}
    </div>
  );
}
