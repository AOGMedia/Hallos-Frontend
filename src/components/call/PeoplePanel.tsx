// import { memo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ParticipantList } from './ParticipantList';
// import { useCallStore } from '@/store/callStore';
// import SearchIcon from '@/components/icons/SearchIcon';
// import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
// import VideoIcon from '@/components/icons/VideoIcon';
// import ShareLinkIcon from '@/components/icons/ShareLinkIcon';
// import CloseXIcon from '@/components/icons/CloseXIcon';
// import type { Participant } from '@/store/callStore';
// import { usePeopleControls } from '@/lib/hooks/usePeopleControls';
// import { useAddHost, useAddAttendee } from '@/hooks/useLive';

// interface PeoplePanelProps {
//   isOpen: boolean;
//   onClose: () => void;
//   hosts: Participant[];
//   audience: Participant[];
// }

// export const PeoplePanel = memo(function PeoplePanel({
//   isOpen,
//   onClose,
//   hosts,
//   audience,
// }: PeoplePanelProps) {
//   const currentUserId = useCallStore((state) => state.currentUserId);
//   const participants = useCallStore((state) => state.participants);
//   const roomId = useCallStore((state) => state.roomId);
//   const addParticipantStore = useCallStore((state) => state.addParticipant);
//   const { muteAll, turnOffAllCameras, shareInvite } = usePeopleControls();
//   const addHostMutation = useAddHost();
//   const addAttendeeMutation = useAddAttendee();
  
//   // Check if current user is a host
//   const currentUser = participants.find((p) => p.id === currentUserId);
//   const isHost = currentUser?.isHost ?? false;

//   const handleMuteAll = () => {
//     if (!isHost) {
//       console.log('Only hosts can mute all participants');
//       return;
//     }
//     muteAll();
//   };

//   const handleTurnOffAllCameras = () => {
//     if (!isHost) {
//       console.log('Only hosts can turn off all cameras');
//       return;
//     }
//     turnOffAllCameras();
//   };

//   const handleShareInvite = () => {
//     shareInvite();
//   };

//   const handleAddHost = async () => {
//     if (!roomId) return;
//     const input = typeof window !== 'undefined' ? window.prompt('Enter host userId') : null;
//     if (!input) return;
//     const res = await addHostMutation.mutateAsync({ id: roomId, userId: input, role: 'cohost' });
//     const host = res.host as unknown as { userId?: string | number } | undefined;
//     const uid = String(host?.userId ?? input);
//     const name = `Host ${uid}`;
//     const initials = name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
//     const p: Participant = { id: uid, name, initials, isMuted: true, isCameraOff: true, isHost: true };
//     const exists = participants.some((x) => x.id === uid);
//     if (!exists) addParticipantStore(p);
//   };

//   const handleAddAttendee = async () => {
//     if (!roomId) return;
//     const input = typeof window !== 'undefined' ? window.prompt('Enter attendee userId') : null;
//     if (!input) return;
//     const res = await addAttendeeMutation.mutateAsync({ id: roomId, userId: input });
//     const attendee = res.attendee as unknown as { userId?: string | number } | undefined;
//     const uid = String(attendee?.userId ?? input);
//     const name = `Attendee ${uid}`;
//     const initials = name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
//     const p: Participant = { id: uid, name, initials, isMuted: true, isCameraOff: true, isHost: false };
//     const exists = participants.some((x) => x.id === uid);
//     if (!exists) addParticipantStore(p);
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ x: '100%' }}
//           animate={{ x: 0 }}
//           exit={{ x: '100%' }}
//           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
//           className="fixed top-[101px] right-0 bottom-0 w-full sm:w-[446px] bg-[#161b26] border-l border-[rgba(234,234,234,0.10)] rounded-tl-xl rounded-bl-xl z-50 flex flex-col overflow-hidden"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between gap-2.5 px-6 py-5 border-b border-[rgba(234,234,234,0.04)]">
//             <h2 className="text-base font-medium text-[#f2f2f2] tracking-[0.08px]">
//               People
//             </h2>
//             <button
//               type="button"
//               onClick={onClose}
//               className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
//             >
//               <CloseXIcon width={24} height={24} color="#f2f2f2" />
//             </button>
//           </div>

//           {/* Controls - Only visible to hosts */}
//           {isHost && (
//             <div className="flex items-center gap-4 px-6 py-4 border-b border-[rgba(234,234,234,0.04)]">
//               <button
//                 type="button"
//                 className="w-[15px] h-[15px] flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
//               >
//                 <SearchIcon width={15} height={15} color="#888c94" />
//               </button>

//               <button
//                 type="button"
//                 onClick={handleMuteAll}
//                 className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(234,234,234,0.04)] rounded hover:bg-[rgba(234,234,234,0.08)] transition-colors"
//               >
//                 <span className="text-[11.76px] font-medium text-[#888c94]">
//                   Mute all
//                 </span>
//                 <MicrophoneIcon width={14} height={18} color="#6a57e5" />
//               </button>

//               <button
//                 type="button"
//                 onClick={handleTurnOffAllCameras}
//                 className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(234,234,234,0.04)] rounded hover:bg-[rgba(234,234,234,0.08)] transition-colors"
//               >
//                 <span className="text-[11.76px] font-medium text-[#888c94] whitespace-nowrap">
//                   Turn all cameras off
//                 </span>
//                 <VideoIcon width={17} height={15} color="#6a57e5" />
//               </button>
//               <button
//                 type="button"
//                 onClick={handleAddHost}
//                 className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(234,234,234,0.04)] rounded hover:bg-[rgba(234,234,234,0.08)] transition-colors"
//               >
//                 <span className="text-[11.76px] font-medium text-[#888c94] whitespace-nowrap">
//                   Add host
//                 </span>
//               </button>
//               <button
//                 type="button"
//                 onClick={handleAddAttendee}
//                 className="flex items-center gap-2.5 px-4 py-3 bg-[rgba(234,234,234,0.04)] rounded hover:bg-[rgba(234,234,234,0.08)] transition-colors"
//               >
//                 <span className="text-[11.76px] font-medium text-[#888c94] whitespace-nowrap">
//                   Add attendee
//                 </span>
//               </button>
//             </div>
//           )}

//           {isHost && (
//             <div className="px-6 py-4 border-b border-[rgba(234,234,234,0.04)] flex items-center gap-4">
//               <button
//                 type="button"
//                 onClick={handleShareInvite}
//                 className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
//               >
//                 <ShareLinkIcon width={13} height={15} color="#6a57e5" />
//                 <span className="text-sm font-normal text-[#6a57e5]">
//                   Share Invite
//                 </span>
//               </button>
//             </div>
//           )}

//           {/* Participants List */}
//           <div className="flex-1 overflow-y-auto px-6 py-6">
//             <div className="flex flex-col gap-6">
//               <ParticipantList title="Hosts" participants={hosts} />
//               <ParticipantList title="Attendees" participants={audience} />
//             </div>
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// });