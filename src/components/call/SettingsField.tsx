// import { memo, type ReactNode } from 'react';

// interface SettingsFieldProps {
//   label: string;
//   icon: ReactNode;
//   value: string;
//   onChange?: (value: string) => void;
//   options?: Array<{ value: string; label: string }>;
//   isDropdown?: boolean;
//   chevronIcon?: ReactNode;
// }

// export const SettingsField = memo(function SettingsField({
//   label,
//   icon,
//   value,
//   onChange,
//   options,
//   isDropdown = false,
//   chevronIcon,
// }: SettingsFieldProps) {
//   return (
//     <div className="flex flex-col gap-1">
//       <label className="text-base font-normal text-[#f2f2f2]" style={{ fontFamily: 'Inter, sans-serif' }}>
//         {label}
//       </label>
//       <div className="settings-input-field">
//         <div className="flex items-center justify-center w-[18px] h-[18px]">
//           {icon}
//         </div>
        
//         {isDropdown && options ? (
//           <select
//             value={value}
//             onChange={(e) => onChange?.(e.target.value)}
//             className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[#eaeaea] cursor-pointer appearance-none"
//           >
//             {options.map((option) => (
//               <option key={option.value} value={option.value} className="bg-[#161b26] text-[#eaeaea]">
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         ) : (
//           <input
//             type="text"
//             value={value}
//             onChange={(e) => onChange?.(e.target.value)}
//             className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-[#eaeaea]"
//           />
//         )}

//         {isDropdown && chevronIcon && (
//           <div className="flex items-center justify-center">
//             {chevronIcon}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// });