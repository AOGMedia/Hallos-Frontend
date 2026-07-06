// import { memo } from 'react';
// import { useCallStore } from '@/store/callStore';
// import { StreamVideo } from './StreamVideo';

// interface ScreenShareViewProps {
//   showSharingIndicator?: boolean;
// }

// export const ScreenShareView = memo(function ScreenShareView({
//   showSharingIndicator = true,
// }: ScreenShareViewProps) {
//   const screenShareStream = useCallStore((state) => state.screenShareStream);

//   if (!screenShareStream) {
//     return null;
//   }

//   return (
//     <div className="relative w-full h-full">
//       {showSharingIndicator && (
//         <div className="absolute top-4 left-4 z-10">
//           <span className="text-sm font-semibold text-[rgba(234,234,234,0.5)]">
//             You are sharing...
//           </span>
//         </div>
//       )}
//       {screenShareStream && (
//         <StreamVideo stream={screenShareStream} muted className="w-full h-full object-contain bg-white rounded-xl" />
//       )}
//     </div>
//   );
// });