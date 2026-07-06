// import { memo } from 'react';
// import type { ReactNode } from 'react';

// interface CallControlButtonProps {
//   icon: ReactNode;
//   label: string;
//   onClick?: () => void;
//   badge?: string | number;
//   isActive?: boolean;
// }

// export const CallControlButton = memo(function CallControlButton({
//   icon,
//   label,
//   onClick,
//   badge,
//   isActive = false,
// }: CallControlButtonProps) {
//   return (
//     <button
//       type="button"
//       className={`call-control-btn relative ${isActive ? 'call-control-btn-active' : ''}`}
//       onClick={onClick}
//     >
//       {icon}
//       <span className={`text-xs font-medium ${isActive ? 'text-[#f2f2f2]' : 'text-[#888c94]'}`}>
//         {label}
//       </span>
//       {badge !== undefined && (
//         <div className="absolute -top-1 -right-1 bg-transparent text-[#f2f2f2] text-xs font-medium w-4 h-4 flex items-center justify-center">
//           {badge}
//         </div>
//       )}
//     </button>
//   );
// });