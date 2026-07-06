// import { memo, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ParticipantRow } from './ParticipantRow';
// import ChevronUpSmallIcon from '@/components/icons/ChevronUpSmallIcon';
// import type { Participant } from '@/store/callStore';

// interface ParticipantListProps {
//   title: string;
//   participants: Participant[];
//   defaultExpanded?: boolean;
// }

// export const ParticipantList = memo(function ParticipantList({
//   title,
//   participants,
//   defaultExpanded = true,
// }: ParticipantListProps) {
//   const [isExpanded, setIsExpanded] = useState(defaultExpanded);

//   return (
//     <div className="flex flex-col gap-4">
//       <div
//         className="flex items-center justify-between gap-4 cursor-pointer"
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <h3 className="text-sm font-semibold text-[rgba(234,234,234,0.5)]">
//           {title}
//         </h3>
//         <motion.div
//           animate={{ rotate: isExpanded ? 180 : 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <ChevronUpSmallIcon width={17} height={9} color="#888c94" />
//         </motion.div>
//       </div>

//       <AnimatePresence>
//         {isExpanded && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="overflow-hidden"
//           >
//             <div className="flex flex-col gap-4">
//               {participants.map((participant) => (
//                 <ParticipantRow
//                   key={participant.id}
//                   participant={participant}
//                 />
//               ))}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// });