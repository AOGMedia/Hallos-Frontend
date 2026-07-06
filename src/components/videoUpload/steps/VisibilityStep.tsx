'use client';

import { useState } from 'react';
import { FormField, TextInput, Select } from '../FormField';
import { RadioGroup } from '../RadioGroup';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { PrivacyType, AgeRestriction } from '@/types/videoUpload';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'vlog', label: 'Vlog' },
];

export function VisibilityStep() {
  const {
    category,
    tags,
    privacy,
    ageRestriction,
    setCategory,
    addTag,
    removeTag,
    setPrivacy,
    setAgeRestriction,
  } = useVideoUploadStore();

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <FormField label="Category" required>
        <Select
        className='bg-[#EAEAEA33] '
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORY_OPTIONS}
        />
      </FormField>

      <FormField 
        label="Add tags"
        description="Press Enter to add a tag"
      >
        <div className="flex flex-col gap-3">
          <TextInput
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 ">
              {tags.map((tag) => (
                <Badge key={tag} variant="tag" className="flex items-center gap-2">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </FormField>
      <div className='flex flex-row  md:gap-40 0 flex-wrap'>


      <FormField label="Privacy">
        <RadioGroup radioContainerStyle='flex flex-col'
          name="privacy"
          value={privacy}
          onChange={(value) => setPrivacy(value as PrivacyType)}
          options={[
            { value: PrivacyType.PRIVATE, label: 'Private' },
            { value: PrivacyType.PUBLIC, label: 'Public' },
            { value: PrivacyType.UNLISTED, label: 'Unlisted' },
            { value: PrivacyType.SCHEDULED, label: 'Scheduled' },
          ]}
          />
      </FormField>

      <FormField label="Age restriction">
        <RadioGroup radioContainerStyle='flex flex-col'
        radioStyle=' flex-row-reverses!'
          name="ageRestriction"
          value={ageRestriction}
          onChange={(value) => setAgeRestriction(value as AgeRestriction)}
          options={[
            { value: AgeRestriction.NONE, label: 'All ages' },
            { value: AgeRestriction.EIGHTEEN_PLUS, label: '18+ Only' },
          ]}
          />
      </FormField>
          </div>
    </div>
  );
}