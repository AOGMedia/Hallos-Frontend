  "use client";
  
  import { useEffect, useState } from "react";
  import { X } from "lucide-react";
  import { useEventStore } from "../../store/useEventStore";

interface RegistrationSuccessProps {
  /** Override the title. Defaults to "Successful!" */
  title?: string;
  /** Override the subtitle line (green text). Defaults to "Thank You {firstname}!" */
  subtitle?: string;
  /** Override the body message. Defaults to the event registration message. */
  message?: string;
  /** Called when the close button is clicked. Defaults to store's setIsModalOpen(false). */
  onClose?: () => void;
  /** Override z-index. Defaults to 50. Use higher values when stacking over other modals. */
  zIndex?: number;
}

export function RegistrationSuccess({
  title,
  subtitle,
  message,
  onClose,
  zIndex = 50,
}: RegistrationSuccessProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [animateCheck, setAnimateCheck] = useState(false);

  // Fall back to event store only when no override props are provided
  const store = useEventStore();
  const formData = store.formData;
  const handleClose = onClose ?? (() => store.setIsModalOpen(false));

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    setTimeout(() => setAnimateCheck(true), 400);
  }, []);

  const displayTitle = title ?? 'Successful!';
  const displaySubtitle = subtitle ?? `Thank You ${formData.firstname || ''}!`;
  const displayMessage = message ?? `You've officially reserved your spot as a ${formData.role || 'participant'}.`;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-black/70 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ zIndex }}
    >
      {/* Modal content */}
      <div 
        className={`text-center bg-[#1F2636] pb-20 px-2 pt-4 rounded-xl shadow-md w-full max-w-md transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-full p-2 bg-[#EAEAEA0F] hover:bg-[#EAEAEA1F] transition-all duration-200 hover:rotate-90 cursor-pointer"
          >
            <X size={24} color="#F2F2F2" />
          </button>
        </div>
        
        <div className="flex items-center justify-center my-4">
          <svg 
            width="100" 
            height="100" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-all duration-700 ${
              animateCheck ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
            }`}
          >
            <circle
              cx="50"
              cy="50"
              r="50"
              fill="#007A1B"
              className="origin-center"
              style={{ animation: animateCheck ? 'pulse 0.6s ease-out' : 'none' }}
            />
            <path 
              d="M34 48.4L45.8 60.2L66 40" 
              stroke="#F2F2F2" 
              strokeWidth="2.4" 
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset={animateCheck ? "0" : "60"}
              style={{ transition: 'stroke-dashoffset 0.6s ease-out 0.2s' }}
            />
          </svg>
        </div>

        <h2 
          className={`text-2xl font-bold text-white mb-4 transform transition-all duration-500 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {displayTitle}
        </h2>
        
        <h3 className="text-[#007A1B] font-bold">{displaySubtitle}</h3>
        <p 
          className={`mb-6 text-white text-xs transform transition-all duration-500 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {displayMessage}
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}