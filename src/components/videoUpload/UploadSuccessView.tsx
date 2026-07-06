"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "lucide-react";
import { CourseCard } from "@/components/course/CourseCard";
import { formatDuration } from "@/utils/videoUploadFormatters";
import { useVideoUploadStore } from "@/store/videoUploadStore";

interface UploadSuccessViewProps {
  videoTitle: string;
  videoDescription: string;
  price: string;
  videoDuration: number;
  thumbnailPreview: string | null;
  onCreateAnother: () => void;
  onGoToVideos: () => void;
  communitySubmissionMessage?: string;
}

export function UploadSuccessView({
  videoTitle,
  videoDescription,
  price,
  videoDuration,
  thumbnailPreview,
  onCreateAnother,
  onGoToVideos,
  communitySubmissionMessage,
}: UploadSuccessViewProps) {
  const { currency } = useVideoUploadStore();
  
  // Format duration from seconds to MM:SS format
  const formattedDuration = formatDuration(videoDuration);

  // Default values for required CourseCard props
  const defaultThumbnail = thumbnailPreview || "/images/default-thumbnail.jpg";
  const defaultAvatar = "/avatars/alex-chapman.jpg";

  return (
    <div className="flex flex-col items-start gap-4 p-6 rounded-2xl shadow-md shadow-black/60">
      <h2 className="text-medium text-text-primary">
        {communitySubmissionMessage || "Upload successful!"}
      </h2>
      <p>{communitySubmissionMessage ? "Your content status can be tracked in the community submissions tab." : "Your video appears like this"}</p>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full max-w-lg">
          <CourseCard
            title={videoTitle || "Untitled Video"}
            description={videoDescription || "No description provided"}
            instructor="You"
            thumbnail={defaultThumbnail}
            avatar={defaultAvatar}
            price={parseFloat(price) || 0}
            currency={currency}
            duration={formattedDuration}
            posted="Just now"
            rating={5.0}
            reviews="0"
            isLive={false}
          />
        </div>

        <div className="flex md:flex-col flex-row gap-2">
          <Button
            variant="primary"
            onClick={onCreateAnother}
            className="flex items-center gap-2 truncate"
          >
            Create another
          </Button>

          <Button
            variant="outline"
            onClick={onGoToVideos}
            className="flex items-center gap-2"
          >
            <span>Go to videos</span>
            <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}