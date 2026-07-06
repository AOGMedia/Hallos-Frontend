'use client';

import { FormField, TextInput, TextArea } from '../FormField';
import { ThumbnailUpload } from '../ThumbnailUpload';
import { useVideoUploadStore } from '@/store/videoUploadStore';
import { Button } from '@/components/ui/Button';

interface VideoDetailsStepProps {
  onGoLiveWithVideo: () => void;
}

export function VideoDetailsStep({ onGoLiveWithVideo }: VideoDetailsStepProps) {
  const {
    videoTitle,
    videoDescription,
    thumbnailPreview,
    setVideoTitle,
    setVideoDescription,
    setThumbnailFile,
    setThumbnailPreview,
  } = useVideoUploadStore();

  const handleThumbnailSelect = (file: File, preview: string) => {
    setThumbnailFile(file);
    setThumbnailPreview(preview);
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        className="self-start"
        onClick={onGoLiveWithVideo}
      >
        Go live with this video
      </Button>
      <FormField label="Video title" required>
        <TextInput
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          placeholder="Enter video title"
        />

      </FormField>

      <FormField label="Description">
        <TextArea
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          placeholder="Enter video description"
        />
      </FormField>

      <FormField
        label="Thumbnail"
        description="16:9 ratio dimension is advised. A good thumbnail stands out and draws viewers' attention"
      >
        <ThumbnailUpload
          onFileSelect={handleThumbnailSelect}
          preview={thumbnailPreview}
        />
      </FormField>

      
    </div>
  );
}