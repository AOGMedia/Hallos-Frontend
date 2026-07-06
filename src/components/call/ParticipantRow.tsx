// import { memo } from 'react';
// import { useCallStore } from '@/store/callStore';
// import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
// import MicrophoneSlashIcon from '@/components/icons/MicrophoneSlashIcon';
// import ThreeDotsVerticalIcon from '@/components/icons/ThreeDotsVerticalIcon';
// import type { Participant } from '@/store/callStore';

// interface ParticipantRowProps {
//   participant: Participant;
// }

// export const ParticipantRow = memo(function ParticipantRow({
//   participant,
// }: ParticipantRowProps) {
//   const currentUserId = useCallStore((state) => state.currentUserId);
//   const participants = useCallStore((state) => state.participants);
  
//   // Check if current user is a host
//   const currentUser = participants.find((p) => p.id === currentUserId);
//   const isHost = currentUser?.isHost ?? false;
  
//   // Show more options only if user is host and not viewing their own row
//   const showMoreOptions = isHost && participant.id !== currentUserId;

//   const handleMoreOptions = () => {
//     // TODO: Implement more options menu
//     console.log('More options for', participant.name);
//   };

//   return (
//     <div className="flex items-center gap-4 px-3 py-2.5 bg-[rgba(234,234,234,0.02)] rounded hover:bg-[rgba(234,234,234,0.04)] transition-colors">
//       {/* Avatar */}
//       <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[rgba(106,87,229,0.3)] to-[rgba(80,153,248,0.3)] border border-[rgba(106,87,229,0.5)]">
//         <span className="text-[10px] font-semibold text-[#f2f2f2]">
//           {participant.initials}
//         </span>
//       </div>

//       {/* Name */}
//       <span className="flex-1 text-sm font-semibold text-[rgba(234,234,234,0.5)] truncate">
//         {participant.name}
//       </span>

//       {/* Mic Status */}
//       <div className="flex items-center gap-2">
//         {participant.isMuted ? (
//           <MicrophoneSlashIcon width={15} height={18} color="#888c94" />
//         ) : (
//           <MicrophoneIcon width={14} height={18} color="#6a57e5" />
//         )}

//         {/* More Options - Only visible to hosts for other participants */}
//         {showMoreOptions && (
//           <button
//             type="button"
//             onClick={handleMoreOptions}
//             className="w-[5px] h-4 flex items-center justify-center hover:opacity-70 transition-opacity"
//           >
//             <ThreeDotsVerticalIcon width={5} height={16} color="#888c94" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// });