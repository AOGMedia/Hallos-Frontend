// import { memo, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ParticipantTile } from './ParticipantTile';
// import ChevronUpSmallIcon from '@/components/icons/ChevronUpSmallIcon';
// import type { Participant } from '@/store/callStore';

// interface ParticipantSectionProps {
//   title: string;
//   participants: Participant[];
//   defaultExpanded?: boolean;
// }

// export const ParticipantSection = memo(function ParticipantSection({
//   title,
//   participants,
//   defaultExpanded = true,
// }: ParticipantSectionProps) {
//   const [isExpanded, setIsExpanded] = useState(defaultExpanded);

//   return (
//     <div className="flex flex-col gap-6 ">
//       <div
//         className="section-header"
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <h2 className="text-sm font-semibold text-[rgba(234,234,234,0.5)]">
//           {title}
//         </h2>
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
//             <div className="flex flex-wrap gap-6 ">
//               {participants.map((participant) => (
//                 <ParticipantTile
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