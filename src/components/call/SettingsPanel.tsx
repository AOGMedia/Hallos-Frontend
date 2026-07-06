// import { memo, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { SettingsField } from './SettingsField';
// import { useCallStore } from '@/store/callStore';
// import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
// import CloseXIcon from '@/components/icons/CloseXIcon';
// import UserIcon from '@/components/icons/UserIcon';
// import VideoIcon from '@/components/icons/VideoIcon';
// import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
// import VolumeIcon from '@/components/icons/VolumeIcon';
// import ChevronDownIcon from '@/components/icons/ChevronDownIcon';

// interface SettingsPanelProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const SettingsPanel = memo(function SettingsPanel({
//   isOpen,
//   onClose,
// }: SettingsPanelProps) {
//   const {
//     userName,
//     selectedCamera,
//     selectedMicrophone,
//     selectedSpeaker,
//     setUserName,
//     setSelectedCamera,
//     setSelectedMicrophone,
//     setSelectedSpeaker,
//   } = useCallStore();

//   const { cameras, microphones, speakers, isLoading } = useMediaDevices();

//   // Set default devices when they become available
//   useEffect(() => {
//     if (!isLoading) {
//       if (!selectedCamera && cameras.length > 0) {
//         setSelectedCamera(cameras[0].deviceId);
//       }
//       if (!selectedMicrophone && microphones.length > 0) {
//         setSelectedMicrophone(microphones[0].deviceId);
//       }
//       if (!selectedSpeaker && speakers.length > 0) {
//         setSelectedSpeaker(speakers[0].deviceId);
//       }
//     }
//   }, [cameras, microphones, speakers, isLoading, selectedCamera, selectedMicrophone, selectedSpeaker, setSelectedCamera, setSelectedMicrophone, setSelectedSpeaker]);

//   const cameraOptions = cameras.map((device) => ({
//     value: device.deviceId,
//     label: device.label,
//   }));

//   const microphoneOptions = microphones.map((device) => ({
//     value: device.deviceId,
//     label: device.label,
//   }));

//   const speakerOptions = speakers.map((device) => ({
//     value: device.deviceId,
//     label: device.label,
//   }));

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ x: '100%' }}
//           animate={{ x: 0 }}
//           exit={{ x: '100%' }}
//           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//           className="fixed top-[101px] right-0 bottom-0 h-[calc(100vh-101px)] w-full sm:w-[446px] bg-[#161b26] border-l border-[rgba(234,234,234,0.10)] rounded-tl-xl rounded-bl-xl z-50 flex flex-col overflow-hidden"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between gap-2.5 px-6 py-5 border-b border-[rgba(234,234,234,0.04)]">
//             <h2 className="text-base font-medium text-[#f2f2f2] tracking-[0.08px]">
//               Settings
//             </h2>
//             <button
//               type="button"
//               onClick={onClose}
//               className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
//             >
//               <CloseXIcon width={24} height={24} color="#f2f2f2" />
//             </button>
//           </div>

//           {/* Settings Form */}
//           <div className="flex-1 overflow-y-auto px-6 py-6">
//             <div className="flex flex-col gap-6">
//               <SettingsField
//                 label="Name"
//                 icon={<UserIcon width={18} height={18} color="#f2f2f2" />}
//                 value={userName}
//                 onChange={setUserName}
//               />

//               <SettingsField
//                 label="Camera"
//                 icon={<VideoIcon width={21} height={18} color="#f2f2f2" />}
//                 value={selectedCamera}
//                 onChange={setSelectedCamera}
//                 options={cameraOptions}
//                 isDropdown={true}
//                 chevronIcon={<ChevronDownIcon width={17} height={9} color="#eaeaea" />}
//               />

//               <SettingsField
//                 label="Microphone"
//                 icon={<MicrophoneIcon width={21} height={18} color="#f2f2f2" />}
//                 value={selectedMicrophone}
//                 onChange={setSelectedMicrophone}
//                 options={microphoneOptions}
//                 isDropdown={true}
//                 chevronIcon={<ChevronDownIcon width={17} height={9} color="#eaeaea" />}
//               />

//               <SettingsField
//                 label="Speaker"
//                 icon={<VolumeIcon width={21} height={17} color="#f2f2f2" />}
//                 value={selectedSpeaker}
//                 onChange={setSelectedSpeaker}
//                 options={speakerOptions}
//                 isDropdown={true}
//                 chevronIcon={<ChevronDownIcon width={17} height={9} color="#eaeaea" />}
//               />
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// });