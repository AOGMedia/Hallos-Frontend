"use client";

import { useState } from "react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "@/styles/phone-input-override.css";
import { Button } from "@/components/ui/Button";
import UserProfileIcon from "@/components/icons/UserProfileIcon";
import ChevronDownSmallIcon from "@/components/icons/ChevronDownSmallIcon";
import { RegistrationRole } from "./types";
import { attendeeFormFields, guestFormFields } from "./registrationMockData";
import type { RegistrationFormProps } from "./types";
import { useRegistration } from "@/hooks/useEventRegistration";
import { useEventStore } from "@/store/useEventStore";
import axios from "axios";
import { RegistrationSuccess } from "./RegistrationSuccess";

export function RegistrationForm({ role }: RegistrationFormProps) {
  const formFields =
    role === RegistrationRole.ATTENDEE ? attendeeFormFields : guestFormFields;

  const { mutateAsync: registerEvent, isPending } = useRegistration();
  const { setFormData, isModalOpen, setIsModalOpen } = useEventStore();

  const [formData, setFormDataLocal] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string): boolean =>
    /^[\d\s+()-]+$/.test(phone) && phone.replace(/\D/g, "").length >= 10;

  const validateField = (name: string, value: string): string => {
    const field = formFields.find((f) => f.name === name);
    if (!field) return "";

    if (field.required && !value.trim()) return `${field.label} is required`;
    if (name === "email" && value && !validateEmail(value))
      return "Please enter a valid email address";
    if (name === "phone" && value && !validatePhone(value))
      return "Please enter a valid phone number";

    return "";
  };

  const handleChange = (name: string, value: string) => {
    setFormDataLocal((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const updated = { ...errors };
      delete updated[name];
      setErrors(updated);
    }
  };

  const handleBlur = (name: string) => {
    const error = validateField(name, formData[name] || "");
    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors: Record<string, string> = {};
    formFields.forEach((field) => {
      const error = validateField(field.name, formData[field.name] || "");
      if (error) newErrors[field.name] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const payload =
      role === RegistrationRole.ATTENDEE
        ? {
          role: formData.role || "Speaker",
          firstname: formData.firstName,
          lastname: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
        }
        : {
          firstname: formData.firstName,
          lastname: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
        };

    try {
      const response = await registerEvent(payload);
      setFormData(response.registration);
      console.log("🚀 Payload sent to /event/register:", payload);
      setIsModalOpen(true);
    } catch (err: unknown) {
      
      //   alert(err.response?.data?.message || 'Registration failed');
      //    console.error(" Registration error:", err.response?.data || err.message);
      // alert(JSON.stringify(err.response?.data || err.message, null, 2)); // show full backend message
      if (axios.isAxiosError(err)) {
        console.warn("⚠️ API error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setIsSubmitting(false);
      setFormDataLocal({}); 
    }
  };

  const isFormValid = () => {
    const requiredFields = formFields.filter((f) => f.required);
    const allRequiredFilled = requiredFields.every((field) =>
      formData[field.name]?.trim()
    );
    return allRequiredFilled && Object.keys(errors).length === 0;
  };

  return (
    <>
      {isModalOpen && <RegistrationSuccess />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Form Title */}
        <div className="form-section-title justify-center">
          <UserProfileIcon width={18} height={18} color="#EAEAEA" />
          <span>
            {role === RegistrationRole.ATTENDEE
              ? "Attendee Form"
              : "Guest Form"}
          </span>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5">
          {formFields.map((field) => {
            if (field.type === "select") {
              return (
                <div key={field.name} className="relative ">
                  <select
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    onBlur={() => handleBlur(field.name)}
                    className="auth-input w-full appearance-none pr-10 "
                  >
                    <option
                      value=""
                      disabled
                      className="bg-black/70 text-white font-bold"
                    >
                      {field.placeholder}:
                    </option>
                    {field.options?.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-black/70"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ">
                    <ChevronDownSmallIcon
                      width={17}
                      height={9}
                      color="#EAEAEA"
                    />
                  </div>
                  {errors[field.name] && (
                    <span className="text-xs text-accent-red mt-1 block">
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              );
            }

            if (field.name === "firstName") {
              const lastNameField = formFields.find(
                (f) => f.name === "lastName"
              );
              return (
                <div
                  key="name-fields"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  <div>
                    <input
                      type="text"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      onBlur={() => handleBlur("firstName")}
                      placeholder={field.placeholder}
                      className="auth-input w-full"
                    />
                    {errors.firstName && (
                      <span className="text-xs text-accent-red mt-1 block">
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  {lastNameField && (
                    <div>
                      <input
                        type="text"
                        value={formData.lastName || ""}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        onBlur={() => handleBlur("lastName")}
                        placeholder={lastNameField.placeholder}
                        className="auth-input w-full"
                      />
                      {errors.lastName && (
                        <span className="text-xs text-accent-red mt-1 block">
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (field.name === "lastName") return null;

            if (field.name === "email") {
              const phoneField = formFields.find((f) => f.name === "phone");
              return (
                <div key="contact-fields" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <input
                      type={field.type}
                      value={formData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder={field.placeholder}
                      className="auth-input w-full"
                    />
                    {errors.email && (
                      <span className="text-xs text-accent-red mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  {phoneField && (
                    <div>
                      <PhoneInput
                        defaultCountry="ng"
                        value={formData.phone || ""}
                        onChange={(value) => handleChange("phone", value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder={phoneField.placeholder}
                        className="auth-input w-full h-12"
                        inputClassName="bg-transparent border-none outline-none text-sm font-semibold text-[#eaeaea] w-full h-12"
                        style={{ height: 48 }}
                        inputStyle={{ height: 48, backgroundColor: 'transparent', border: 'none', color: '#eaeaea', paddingTop: 0, paddingBottom: 0 }}
                      />
                      {errors.phone && (
                        <span className="text-xs text-accent-red mt-1 block">
                          {errors.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            if (field.name === "phone") return null;

            return (
              <div key={field.name}>
                <input
                  type={field.type}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  placeholder={field.placeholder}
                  className="auth-input w-full"
                />
                {errors[field.name] && (
                  <span className="text-xs text-accent-red mt-1 block">
                    {errors[field.name]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isFormValid() || isSubmitting || isPending}
          className="w-full mt-2"
        >
          {isSubmitting || isPending ? "Submitting..." : "Register"}
        </Button>
      </form>
    </>
  );
}
