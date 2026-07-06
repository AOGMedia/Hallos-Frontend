// import { memo } from 'react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { CallTimer } from './CallTimer';
// import { CallControlButton } from './CallControlButton';
// import { useCallStore } from '@/store/callStore';
// import { useScreenShare } from '@/lib/hooks/useScreenShare';
// import ShareLinkIcon from '@/components/icons/ShareLinkIcon';
// import { usePeopleControls } from '@/lib/hooks/usePeopleControls';
// import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
// import MicrophoneSlashIcon from '@/components/icons/MicrophoneSlashIcon';
// import VideoSlashIcon from '@/components/icons/VideoSlashIcon';
// import VideoIcon from '@/components/icons/VideoIcon';
// import ShareIcon from '@/components/icons/ShareIcon';
// import PeopleIcon from '@/components/icons/PeopleIcon';
// import SettingsIcon from '@/components/icons/SettingsIcon';
// import PhoneIcon from '@/components/icons/PhoneIcon';

// interface CallTopBarProps {
//   onPeopleClick?: () => void;
//   onSettingsClick?: () => void;
//   isPeoplePanelOpen?: boolean;
//   isSettingsPanelOpen?: boolean;
// }

// export const CallTopBar = memo(function CallTopBar({
//   onPeopleClick,
//   onSettingsClick,
//   isPeoplePanelOpen = false,
//   isSettingsPanelOpen = false,
// }: CallTopBarProps) {
//   const router = useRouter();
//   const {
//     isMicOn,
//     isVideoOn,
//     isScreenSharing,
//     participantCount,
//     toggleMic,
//     toggleCamera,
//     endCall,
//   } = useCallStore();

//   const currentUserId = useCallStore((s) => s.currentUserId)
//   const participants = useCallStore((s) => s.participants)
//   const isHost = participants.find((p) => p.id === currentUserId)?.isHost ?? false
//   const showInvite = isHost || participants.length === 0

//   const { startSharing, stopSharing } = useScreenShare(currentUserId);
//   const { shareInvite } = usePeopleControls();

//   const handleEndCall = () => {
//     endCall();
//     router.push('/dashboard');
//   };

//   const handleScreenShare = async () => {
//     if (isScreenSharing) {
//       stopSharing();
//     } else {
//       await startSharing();
//     }
//   };

//   return (
//     <div className="w-full border-b border-[rgba(234,234,234,0.16)] bg-[linear-gradient(0deg,rgba(31,38,54,0.50),rgba(31,38,54,0.50)),#000000] px-4 sm:px-10 py-4">
//       <div className="flex items-center justify-between gap-4">
//         {/* Logo and Timer */}
//         <div className="flex items-center gap-4">
//           <Image
//             src="/logo-dashboard.png"
//             alt="Learning247"
//             width={183}
//             height={45}
//             className="h-[45px] w-auto hidden sm:block"
//           />
//           <CallTimer />
//         </div>

//         {/* Controls */}
//         <div className="flex items-center gap-6 sm:gap-12">
//           {/* Media Controls */}
//           <div className="flex items-center gap-4 sm:gap-6">
//             <CallControlButton
//               icon={
//                 isMicOn ? (
//                   <MicrophoneIcon width={14} height={18} color="#6a57e5" />
//                 ) : (
//                   <MicrophoneSlashIcon width={15} height={18} color="#888c94" />
//                 )
//               }
//               label={isMicOn ? 'Mic on' : 'Mic off'}
//               onClick={toggleMic}
//             />
//             <CallControlButton
//               icon={
//                 isVideoOn ? (
//                   <VideoIcon width={18} height={18} color="#6a57e5" />
//                 ) : (
//                   <VideoSlashIcon width={18} height={18} color="#888c94" />
//                 )
//               }
//               label={isVideoOn ? 'Video on' : 'Video off'}
//               onClick={toggleCamera}
//               isActive={isVideoOn}
//             />
//             <CallControlButton
//               icon={
//                 <ShareIcon 
//                   width={17} 
//                   height={17} 
//                   color={isScreenSharing ? '#6a57e5' : '#888c94'} 
//                 />
//               }
//               label={isScreenSharing ? 'Sharing' : 'Share'}
//               onClick={handleScreenShare}
//               isActive={isScreenSharing}
//             />
//           </div>

//           {/* Divider */}
//           <div className="hidden sm:block w-px h-[33px] bg-[rgba(234,234,234,0.20)]" />

//           {/* Settings Controls */}
//           <div className="flex items-center gap-4 sm:gap-6">
//             {showInvite && (
//               <CallControlButton
//                 icon={<ShareLinkIcon width={13} height={15} color="#6a57e5" />}
//                 label="Invite"
//                 onClick={shareInvite}
//               />
//             )}
//             <CallControlButton
//               icon={<PeopleIcon width={17} height={18} color={isPeoplePanelOpen ? '#6a57e5' : '#888c94'} />}
//               label="People"
//               badge={participantCount}
//               onClick={onPeopleClick}
//               isActive={isPeoplePanelOpen}
//             />
//             <CallControlButton
//               icon={<SettingsIcon width={16} height={18} color={isSettingsPanelOpen ? '#6a57e5' : '#888c94'} />}
//               label="Settings"
//               onClick={onSettingsClick}
//               isActive={isSettingsPanelOpen}
//             />
//           </div>

//           {/* Divider */}
//           <div className="hidden sm:block w-px h-[33px] bg-[rgba(234,234,234,0.20)]" />

//           {/* End Button */}
//           <button
//             type="button"
//             onClick={handleEndCall}
//             className="flex items-center gap-2 bg-[#f5313b] rounded-full px-6 py-3 hover:opacity-90 transition-opacity"
//           >
//             <PhoneIcon width={21} height={22} color="#f2f2f2" />
//             <span className="text-base font-bold text-white hidden sm:inline">
//               End
//             </span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// });