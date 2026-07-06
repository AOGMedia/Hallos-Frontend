"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { RoleSelection } from "./RoleSelection";
import { RegistrationForm } from "./RegistrationForm";
import { CareerIgniteForm } from "./CareerIgniteForm";
import CloseIcon from "@/components/icons/CloseIcon";
import { RegistrationRole } from "./types";
import type { RegistrationModalProps } from "./types";

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const isCareerIgnite = true; // Hardcoded for now as per current priority
  
  const [step, setStep] = useState<"role" | "form">(isCareerIgnite ? "form" : "role");
  const [selectedRole, setSelectedRole] = useState<RegistrationRole | null>(
    isCareerIgnite ? RegistrationRole.ATTENDEE : null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(isCareerIgnite ? "form" : "role");
        setSelectedRole(isCareerIgnite ? RegistrationRole.ATTENDEE : null);
        setShowSuccess(false);
      }, 300);
    }
  }, [isOpen, isCareerIgnite]);

  const handleRoleSelect = (role: RegistrationRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep("form");
    }
  };

  const handleBack = () => {
    if (!isCareerIgnite) {
      setStep("role");
    }
  };

  const handleClose = () => {
    if (!showSuccess) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      // Removed onClick={handleClose} to prevent closing when clicking outside
    >
      <div
        className={`modal-content scrollbar-hide !overflow-hidden flex flex-col ${
          isCareerIgnite ? 'max-w-4xl !p-0' : 'max-w-[800px] !pt-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edge-to-Edge Header for Career Ignite */}
        {isCareerIgnite && !showSuccess && (
          <div className="relative w-full flex-shrink-0 aspect-[21/9] sm:aspect-[3.5/1] bg-gradient-to-br from-[#4C2D82] via-[#2D3E8E] to-[#1F2636] border-b border-white/10">
            {/* Background mesh decoration */}
            <Image
              src="/images/event/bg-mesh-slots.svg"
              alt=""
              aria-hidden="true"
              fill
              className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none select-none mix-blend-screen"
            />
            
            {/* Header Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className="text-white text-base sm:text-lg font-bold tracking-[0.2em] mb-1 drop-shadow-md">
                HALLOS
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl uppercase tracking-tight leading-tight">
                Millionaires Retreat 2026
              </h2>
              <p className="text-white/80 mt-1 sm:mt-2 text-xs sm:text-base font-medium tracking-wide">
                Program application form
              </p>
            </div>

            {/* Absolute Close Button (Overlays Header) */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:opacity-70 transition-opacity bg-black/20 hover:bg-black/40 rounded-full cursor-pointer z-50"
              aria-label="Close modal"
            >
              <CloseIcon width={24} height={24} color="#F2F2F2" />
            </button>
          </div>
        )}

        {/* Scrollable Container for Form Content */}
        <div className={`flex-1 overflow-y-auto scrollbar-hide px-6 sm:px-10 ${
          isCareerIgnite ? 'py-8' : 'pt-4 pb-8'
        }`}>
          {/* Top Bar for non-CareerIgnite */}
          {!isCareerIgnite && (
            <div className="flex items-center justify-between pb-6">
              <button
                onClick={handleBack}
                className="text-sm cursor-pointer text-text-muted hover:text-text-primary flex items-center gap-2 "
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M5 12L12 19M5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ display: step === 'role' ? 'none' : 'block' }}
                  />
                </svg>
              </button>
              
              <div className="flex-1 flex justify-center pl-10">
                <Image
                  src="/transparentlogo.svg"
                  alt="Learning247"
                  width={183}
                  height={45}
                  className="w-[140px] sm:w-[183px] h-auto"
                />
              </div>

              <button
                onClick={handleClose}
                className=" p-2 hover:opacity-70 transition-opacity bg-[#EAEAEA0F] rounded-full cursor-pointer"
                aria-label="Close modal"
                disabled={showSuccess}
              >
                <CloseIcon width={24} height={24} color="#888C94" />
              </button>
            </div>
          )}

          {!isCareerIgnite && (
            <div className="flex flex-col pb-8 gap-2">
              <h2 className="modal-title text-xl sm:text-3xl font-bold text-center uppercase tracking-wider">
                Creators summit
              </h2>
              <p className="modal-subtitle text-sm sm:text-base text-center text-[#888C94]">
                Secure your spot at the most anticipated tech event
              </p>
            </div>
          )}

          {/* Content Render */}
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#6A57E5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Registration Successful!
              </h3>
              <p className="text-text-muted text-center">
                Check your email for confirmation details.
              </p>
            </div>
          ) : isCareerIgnite ? (
            <CareerIgniteForm />
          ) : step === "role" ? (
            <>
              <RoleSelection
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
              />

              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
                disabled={!selectedRole}
                className="w-full mt-8 sm:mt-12"
              >
                Continue
              </Button>
            </>
          ) : (
            <RegistrationForm
              role={selectedRole!}
              onCancel={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
