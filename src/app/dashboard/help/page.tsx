"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { ShareFeedbackModal } from "@/components/ui/ShareFeedbackModal";
import { FAQModal } from "@/components/ui/FAQModal";

const HelpPage = React.memo(() => {
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShareFeedback = useCallback(() => {
    setShowFeedbackModal(true);
  }, []);

  // const handleChatWithUs = useCallback(() => {
  //   router.push('/dashboard/help/chat');
  // }, [router]);

  const handleFAQ = useCallback(() => {
    setShowFAQModal(true);
  }, []);

  const handleCloseFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
  }, []);

  const handleCloseFAQModal = useCallback(() => {
    setShowFAQModal(false);
  }, []);

  const menuItems = React.useMemo(
    () => [
      {
        title: "Share Feedback",
        onClick: handleShareFeedback,
      },
      // {
      //   title: 'Chat with us',
      //   onClick: handleChatWithUs,
      // },
      {
        title: "FAQ",
        onClick: handleFAQ,
      },
    ],
    [
      handleShareFeedback,
      // , handleChatWithUs

      handleFAQ,
    ],
  );

  return (
    <>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded transition-colors"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-lg font-medium text-white">Help Center</h1>
        </div>

        {/* Menu Items */}
        <div className="px-4 pt-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="flex items-center justify-between w-full py-4 hover:bg-white/5 rounded-lg transition-colors group"
            >
              <span className="text-base text-white">{item.title}</span>
              <ChevronDownIcon className="w-4 h-4 text-white/60 -rotate-90 group-hover:text-white transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Share Feedback Modal */}
      <ShareFeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleCloseFeedbackModal}
      />

      {/* FAQ Modal */}
      <FAQModal isOpen={showFAQModal} onClose={handleCloseFAQModal} />
    </>
  );
});

HelpPage.displayName = "HelpPage";

export default HelpPage;
