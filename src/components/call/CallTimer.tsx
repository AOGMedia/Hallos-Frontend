// import { memo, useEffect } from 'react';
// import { useCallStore } from '@/store/callStore';
// import { formatCallDuration } from '@/utils/formatters';
// import RecordDotIcon from '@/components/icons/RecordDotIcon';

// export const CallTimer = memo(function CallTimer() {
//   const { callDuration, incrementCallDuration, isCallActive } = useCallStore();

//   useEffect(() => {
//     if (!isCallActive) return;

//     const interval = setInterval(() => {
//       incrementCallDuration();
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [incrementCallDuration, isCallActive]);

//   return (
//     <div className="flex items-center gap-2.5">
//       <RecordDotIcon width={26} height={26} color="#f5313b" />
//       <span className="call-timer-text">{formatCallDuration(callDuration)}</span>
//     </div>
//   );
// });