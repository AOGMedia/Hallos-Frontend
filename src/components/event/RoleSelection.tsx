import { RadioOptionCard } from './RadioOptionCard';
import UserProfileIcon from '@/components/icons/UserProfileIcon';
import { RegistrationRole } from './types';
import type { RoleSelectionProps } from './types';

export function RoleSelection({ selectedRole, onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="flex flex-col gap-8 sm:gap-12">
      <div className="form-section-title">
        <UserProfileIcon width={18} height={18} color="#EAEAEA" />
        <span>Join as guest or attendee</span>
      </div>
      
      <div className="flex flex-col gap-5">
        <RadioOptionCard
          title="Members and Delegates"
          description="Includes participants, speakers, panelists, and other roles."
          selected={selectedRole === RegistrationRole.ATTENDEE}
          onClick={() => onRoleSelect(RegistrationRole.ATTENDEE)}
        />
        
        <RadioOptionCard
          title="Guest"
          description="For invited visitors or accompanying persons"
          selected={selectedRole === RegistrationRole.GUEST}
          onClick={() => onRoleSelect(RegistrationRole.GUEST)}
        />
      </div>
    </div>
  );
}