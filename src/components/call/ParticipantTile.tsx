// import { memo } from 'react';
// import { ParticipantAvatar } from './ParticipantAvatar';
// import { StreamVideo } from './StreamVideo';
// import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
// import MicrophoneSlashIcon from '@/components/icons/MicrophoneSlashIcon';
// import type { Participant } from '@/store/callStore';

// interface ParticipantTileProps {
//   participant: Participant;
// }

// export const ParticipantTile = memo(function ParticipantTile({
//   participant,
// }: ParticipantTileProps) {
//   return (
//     <div className="participant-tile w-full sm:w-[210px] ">
//       {participant.stream && !participant.isCameraOff ? (
//         <StreamVideo stream={participant.stream} muted className="w-full h-[180px] object-cover bg-black rounded-xl" />
//       ) : (
//         <ParticipantAvatar initials={participant.initials} size="lg" />
//       )}
//       <span className="text-sm font-semibold text-[rgba(234,234,234,0.5)] text-center">
//         {participant.name}
//       </span>
//       <div className="absolute bottom-12 right-16">
//         {participant.isMuted ? (
//           <MicrophoneSlashIcon width={15} height={18} color="#888c94" />
//         ) : (
//           <MicrophoneIcon width={14} height={18} color="#6a57e5" />
//         )}
//       </div>
//     </div>
//   );
// });