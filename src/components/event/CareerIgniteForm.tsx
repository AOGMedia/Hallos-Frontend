"use client";

import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "@/styles/phone-input-override.css";
import { Button } from "@/components/ui/Button";
import { careerIgniteFormFields } from "./careerIgniteMockData";
import { useCampaignRegistration } from "@/hooks/useCampaignRegistration";
import axios from "axios";

export function CareerIgniteForm() {
  // UI LOCK: Set to false to remove the lock
  const UI_LOCK_ENABLED = false; // Set to true to enable the UI lock

  const { mutateAsync: registerCampaign, isPending } = useCampaignRegistration();

  const [formData, setFormDataLocal] = useState<Record<string, string>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [otherModeActive, setOtherModeActive] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const validatePhone = (phone: string): boolean =>
    /^[\d\s+()-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 10;

  const validateField = (name: string, value: string, required: boolean, label: string, isOther: boolean = false, otherValue: string = ""): string => {
    if (isOther) {
      if (required && !otherValue.trim()) return `Please specify your ${label.toLowerCase()}`;
      return "";
    }
    if (required && !value.trim()) return `${label} is required`;
    if (name === "email" && value && !validateEmail(value))
      return "Please enter a valid email address";
    if (name === "phoneNumber" && value && !validatePhone(value))
      return "Please enter a valid phone number";
    return "";
  };

  const handleChange = (name: string, value: string) => {
    setFormDataLocal((prev) => ({ ...prev, [name]: value }));
    const errorName = name === 'phone' ? 'phoneNumber' : name;
    if (errors[errorName]) {
      const updated = { ...errors };
      delete updated[errorName];
      setErrors(updated);
    }
  };

  const handleOtherValueChange = (name: string, value: string) => {
    setOtherValues((prev) => ({ ...prev, [name]: value }));
    // Update formData so the select visually reflects the typed value
    setFormDataLocal((prev) => ({ ...prev, [name]: value || "Other" }));
    if (errors[`${name}Other`]) {
      const updated = { ...errors };
      delete updated[`${name}Other`];
      setErrors(updated);
    }
  };

  const handleRemoveOtherValue = (name: string) => {
    setOtherValues((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setOtherModeActive((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const allFields = [...careerIgniteFormFields.personalInfo, ...careerIgniteFormFields.careerInfo];
    
    allFields.forEach((field) => {
      const value = formData[field.name] || "";
      const isOtherSelected = value === "Other";
      const otherValue = otherValues[field.name] || "";
      
      if (isOtherSelected) {
        const error = validateField(field.name, value, field.required, field.label, true, otherValue);
        if (error) newErrors[`${field.name}Other`] = error;
      } else {
        const error = validateField(field.name, value, field.required, field.label);
        if (error) newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!agreedToTerms) {
      alert("Please agree to the Terms and Privacy Policy");
      return;
    }

    setIsSubmitting(true);

    const getValue = (name: string) => {
      return formData[name] === "Other" ? otherValues[name] : formData[name];
    };

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phone,
      location: getValue("location"),
      talent: getValue("talent"),
      careerPath: getValue("careerPath"),
      jobDescription: formData.jobDescription,
      whatToLearn: formData.reasonForJoining,
    };

    try {
      const response = await registerCampaign(payload);
      // Redirect to Paystack in new window
      if (response.authorizationUrl) {
        window.open(response.authorizationUrl, '_blank', 'noopener,noreferrer');
        // No success state here as per request; waiting for payment verification
      } else {
        alert("Registration initiated, but payment URL was not found.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Registration failed");
      } else {
        alert("An unexpected error occurred during registration.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: typeof careerIgniteFormFields.personalInfo[number]) => {
    const fieldName = field.name === 'phoneNumber' ? 'phone' : field.name;
    const hasError = !!errors[field.name];
    const hasOtherError = !!errors[`${field.name}Other`];
    const isOtherMode = !!otherModeActive[fieldName];
    const isOtherSelected = formData[fieldName] === "Other";

    return (
      <div key={field.name} className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-[#eaeaea] flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-accent-red ml-0.5">*</span>}
        </label>
        
        {field.type === "select" ? (
          <>
            <div className="relative">
              <select
                value={formData[fieldName] || ""}
                onChange={(e) => {
                  if (e.target.value === "Other") {
                    setOtherModeActive((prev) => ({ ...prev, [fieldName]: true }));
                    handleChange(fieldName, "Other");
                  } else {
                    handleRemoveOtherValue(field.name);
                    handleChange(fieldName, e.target.value);
                  }
                }}
                className="auth-input w-full appearance-none pr-10"
              >
                <option value="" disabled className="bg-[#1f2636]">
                  {field.placeholder}
                </option>
                {field.options?.map((option: string) => (
                  <option key={option} value={option} className="bg-[#1f2636]">
                    {option}
                  </option>
                ))}
                {isOtherMode && otherValues[field.name] && (
                  <option value={otherValues[field.name]} className="bg-[#1f2636]">
                    {otherValues[field.name]}
                  </option>
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L6 6L11 1" stroke="#EAEAEA" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            {isOtherMode && (
              <div className="mt-1.5">
                <input
                  type="text"
                  value={otherValues[field.name] || ""}
                  onChange={(e) => handleOtherValueChange(field.name, e.target.value)}
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  className="auth-input w-full"
                  autoFocus
                />
                {hasOtherError && (
                  <span className="text-xs text-accent-red mt-1 block">{errors[`${field.name}Other`]}</span>
                )}
              </div>
            )}
          </>
        ) : field.type === "textarea" ? (
          <textarea
            value={formData[fieldName] || ""}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="auth-input w-full min-h-[120px] resize-none py-3"
          />
        ) : field.type === "tel" ? (
          <PhoneInput
            defaultCountry="ng"
            value={formData[fieldName] || ""}
            onChange={(value) => handleChange(fieldName, value)}
            placeholder={field.placeholder}
            className="auth-input w-full h-12"
            inputClassName="bg-transparent border-none outline-none text-sm font-semibold text-[#eaeaea] w-full h-12"
            style={{ height: 48 }}
            inputStyle={{ height: 48, backgroundColor: 'transparent', border: 'none', color: '#eaeaea' }}
          />
        ) : (
          <input
            type={field.type}
            value={formData[fieldName] || ""}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={field.placeholder}
            className="auth-input w-full"
          />
        )}
        
        {hasError && (
          <span className="text-xs text-accent-red mt-1">{errors[field.name]}</span>
        )}
      </div>
    );
  };

  // Remove success state check here as verification happens on a separate page

  return (
    <div className="w-full mx-auto pb-12">
      {/* Form Info Icon matched to screenshot */}
      <div className="flex items-center justify-center gap-3 mb-10 text-[#888C94] text-sm">
        <div className="w-6 h-6 rounded-full border border-[#888C94] flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <span className="font-medium">Kindly fill the form below</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Personal Information Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-accent-red text-lg">*</span>
            <h3 className="text-lg font-semibold text-[#eaeaea]">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerIgniteFormFields.personalInfo.slice(0, 2).map(renderField)}
          </div>
          {careerIgniteFormFields.personalInfo.slice(2).map(renderField)}
          
          <div className="border-b border-white/5 pt-4"></div>
        </section>

        {/* Career Information Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-accent-red text-lg">*</span>
            <h3 className="text-lg font-semibold text-[#eaeaea]">Career Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerIgniteFormFields.careerInfo.slice(0, 2).map(renderField)}
          </div>
          {careerIgniteFormFields.careerInfo.slice(2).map(renderField)}
        </section>

        {/* Requirements and Submit */}
        <div className="pt-6 space-y-6">
          <label className="flex items-start gap-4 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="peer h-6 w-6 appearance-none rounded border-2 border-white/20 bg-white/5 transition-all checked:bg-[#6A57E5] checked:border-[#6A57E5]"
              />
              <svg className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-[#888C94] leading-relaxed">
              By checking this you agree to the <span className="text-[#6A57E5] hover:underline font-medium">Terms of use and privacy policy</span>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={UI_LOCK_ENABLED || isSubmitting || isPending || !agreedToTerms}
            className="w-full h-16 bg-[#6A57E5] hover:bg-[#6A57E5]/90 text-white rounded-full flex items-center justify-center gap-3 text-xl font-bold shadow-2xl shadow-[#6A57E5]/30 transition-all active:scale-[0.98]"
          >
            {isSubmitting || isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <span>Pay N3,000</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
