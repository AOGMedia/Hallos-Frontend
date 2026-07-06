'use client';

import { FormField, TextInput, Select } from '../FormField';
import { RadioGroup } from '../RadioGroup';
import { CurrencySelect } from '../CurrencySelect';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { VideoType } from '@/types/videoUpload';

export function VideoElementsStep() {
  const {
    videoType,
    restrictEmbedding,
    price,
    currency,
    setVideoType,
    setRestrictEmbedding,
    setPrice,
    setCurrency,
  } = useVideoUploadStore();

  return (
    <div className="flex flex-col gap-6">
      <div className='grid max-w-md grid-cols-1 md:grid-cols-2 md:gap-10 '>

      <FormField label="What are you uploading?" required>
        <Select
          value={videoType}
          onChange={(e) => setVideoType(e.target.value as VideoType)}
          options={[
            { value: VideoType.LONG, label: 'Long' },
            { value: VideoType.SHORT, label: 'Short' },
          ]}
          />
      </FormField>

      <FormField label="Restrict from embedding?" >
        <RadioGroup
        radioStyle=''
          name="restrictEmbedding"
          value={restrictEmbedding ? 'yes' : 'no'}
          onChange={(value) => setRestrictEmbedding(value === 'yes')}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          
          />
      </FormField>
          </div>

          

      {videoType === VideoType.LONG && (
        <FormField 
          label="Price (leave empty for free videos)"
        >
          <div className="flex items-center gap-2">
            <CurrencySelect value={currency} onChange={setCurrency} />
            <TextInput
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="flex-1"
            />
          </div>
        </FormField>
      )}
    </div>
  );
}