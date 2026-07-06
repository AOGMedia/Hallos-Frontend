import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { UploadMode, UploadStep } from "@/types/videoUpload";
import LiveDotIcon from "@/components/icons/LiveDotIcon";

interface UploadHeaderProps {
  uploadMode: UploadMode;
  uploadComplete: boolean;
  currentStep: UploadStep;
  previousStep: () => void;
  handleLiveBack: () => void;
}

export const UploadHeader = memo(function UploadHeader({
  uploadMode,
  uploadComplete,
  currentStep,
  previousStep,
  handleLiveBack,
}: UploadHeaderProps) {
  const getHeaderConfig = () => {
    if (uploadMode === UploadMode.GO_LIVE) {
      return { title: "Live Event", showBack: true, onBack: handleLiveBack };
    }

    if (uploadComplete) {
      return { title: "Upload new video", showBack: false, onBack: undefined };
    }

    switch (currentStep) {
      case UploadStep.FILE_UPLOAD:
        return { title: "Upload video", showBack: false, onBack: undefined };
      case UploadStep.VIDEO_DETAILS:
        return { title: "Video details", showBack: true, onBack: previousStep };
      case UploadStep.VIDEO_ELEMENTS:
        return { title: "Video elements", showBack: true, onBack: previousStep };
      case UploadStep.VISIBILITY:
        return { title: "Visibility settings", showBack: true, onBack: previousStep };
      default:
        return { title: "", showBack: false, onBack: undefined };
    }
  };

  const { title, showBack, onBack } = getHeaderConfig();

  return (
    <div className="p-6 md:p-8 border-b border-border/10">
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {showBack && (
            <motion.button
              key="back-button"
              onClick={onBack}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="hover:opacity-70 transition-opacity"
            >
              <ArrowLeftIcon width={19} height={14} color="#F2F2F2" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.h2
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="text-[32px] font-medium text-text-primary flex text-center items-center"
          >
            {title} {uploadMode === UploadMode.GO_LIVE&&(
                <LiveDotIcon
                 width={15}
                height={15}
                className="sm:w-5 sm:h-5 animate-pulse"
                />
            )}
          </motion.h2>
        </AnimatePresence>
      </div>
    </div>
  );
});
