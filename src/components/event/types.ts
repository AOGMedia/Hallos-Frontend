// Props types
export interface EventSectionProps {
  eventDate: string; 
  eventTitle: string;
  eventLocation: string;
  eventDescription: string;
  eventImage: string;
  backgroundImage: string;
  qrCodeImage: string;
}

export interface CountdownTimerProps {
  targetDate: string; 
}

export interface TimeUnit {
  value: number;
  label: string;
}

// Registration types
export enum RegistrationRole {
  ATTENDEE = "attendee",
  GUEST = "guest"
}

export interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: RegistrationFormData) => void;
}

export interface RoleSelectionProps {
  selectedRole: RegistrationRole | null;
  onRoleSelect: (role: RegistrationRole) => void;
}

export interface RegistrationFormProps {
  role: RegistrationRole;
  onSubmit?: (data: RegistrationFormData) => void;
  onCancel: () => void;
}

export interface RegistrationFormData {
  role: RegistrationRole;
  attendeeRole?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phone?: string;
  location?: string;
  talent?: string;
  careerPath?: string;
  jobDescription?: string;
  reasonForJoining?: string;
  agreeToTerms: boolean;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  required: boolean;
  placeholder: string;
  options?: string[];
}
export interface EventRegisterPayload {
  role?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  location: string;
  talent?: string;
  careerPath?: string;
  jobDescription?: string;
  reasonForJoining?: string;
}