"use client";
import React from "react";
import { VideoUploadModal } from "@/components/videoUpload";
// import { useVideoModalStore } from "@/store/videoModalStore";

const page = () => {
  //   const { isUploadModalOpen, closeUploadModal } = useVideoModalStore();
  return (
    <div className="">
      <VideoUploadModal
      // isOpen={isUploadModalOpen}
      // onClose={closeUploadModal}
      />
    </div>
  );
};

export default page;
