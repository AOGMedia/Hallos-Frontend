import type { RegistrationFormData, FormFieldConfig } from './types';

// Mock data for registration form
export const mockRootProps = {
  isOpen: false,
  onClose: () => {},
  onSubmit: (data: RegistrationFormData) => {
    console.log('Registration submitted:', data);
  }
};

// Form field configurations
export const attendeeFormFields: FormFieldConfig[] = [
  { name: "role", label: "Select Role", type: "select", required: true, placeholder: "Select Role", options: ["Speaker", "Panelist", "Media", "Creator","Others"] },
  { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "First Name" },
  { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Last Name" },
  { name: "email", label: "Email address", type: "email", required: true, placeholder: "Email address" },
  { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "pls enter whatsApp Number" },
  { name: "location", label: "Location", type: "select", required: true, placeholder: "Location", options: ["Enugu","Imo","Lagos", "Abia","Abuja", "Port Harcourt", "Kano", "Other"] }
];

export const guestFormFields: FormFieldConfig[] = [
  { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "First Name" },
  { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Last Name" },
  { name: "email", label: "Email address", type: "email", required: true, placeholder: "Email address" },
  { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "pls enter whatsApp Number" },
  { name: "location", label: "Location", type: "select", required: true, placeholder: "Location", options: ["Enugu", "Lagos", "Abuja", "Port Harcourt", "Kano", "Other"] }
];

// // Mock API implementation
// export const mockRegistrationAPI = {
//   submitRegistration: async (data: RegistrationFormData) => {
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     return {
//       success: true,
//       message: "Registration successful! Check your email for confirmation.",
//       registrationId: `REG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
//     };
//   }
// };