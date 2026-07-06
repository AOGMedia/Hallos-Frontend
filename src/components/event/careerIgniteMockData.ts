import { FormFieldConfig } from './types';

export const careerIgniteFormFields = {
  personalInfo: [
    { name: "firstName", label: "First Name", type: "text", required: true, placeholder: "Enter First Name" },
    { name: "lastName", label: "Last Name", type: "text", required: true, placeholder: "Enter Last Name" },
    { name: "email", label: "Email Address", type: "email", required: true, placeholder: "Enter your email address" },
    { name: "phone", label: "Phone number", type: "tel", required: true, placeholder: "Enter phone number" },
    { name: "location", label: "Location", type: "select", required: true, placeholder: "Select location", options: ["Lagos", "Abuja", "Port Harcourt", "Enugu", "Kano", "Other"] },
  ] as FormFieldConfig[],
  careerInfo: [
    { 
      name: "talent", 
      label: "Talent", 
      type: "select", 
      required: true, 
      placeholder: "Select from list", 
      options: ["Content Creator", "Developer", "Designer", "Marketer", "Other"] 
    },
    { 
      name: "careerPath", 
      label: "Career Path", 
      type: "select", 
      required: true, 
      placeholder: "Select from list", 
      options: ["Freelancing", "Full-time Job", "Entrepreneurship", "Other"] 
    },
    { 
      name: "jobDescription", 
      label: "tell us little about you", 
      type: "textarea", 
      required: true, 
      placeholder: "briefly tell us about you" 
    },
    { 
      name: "reasonForJoining", 
      label: "Why do you want to join?", 
      type: "textarea", 
      required: true, 
      placeholder: "Explain briefly why you want to join this program" 
    },
  ] as FormFieldConfig[]
};
