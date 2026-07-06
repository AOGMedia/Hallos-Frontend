// import { memo } from 'react';

// interface ParticipantAvatarProps {
//   initials: string;
//   size?: 'sm' | 'md' | 'lg';
// }

// export const ParticipantAvatar = memo(function ParticipantAvatar({
//   initials,
//   size = 'lg',
// }: ParticipantAvatarProps) {
//   const sizeClasses = {
//     sm: 'w-10 h-10 text-sm',
//     md: 'w-16 h-16 text-lg',
//     lg: 'w-[70px] h-[70px] text-xl',
//   };

//   return (
//     <div className={`participant-avatar ${sizeClasses[size]}`}>
//       {initials}
//     </div>
//   );
// });