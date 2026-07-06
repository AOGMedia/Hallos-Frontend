import { LogOut } from 'lucide-react';
import { ToggleSwitch } from '@/components/videoUpload/ToggleSwitch';
import { FormSelect } from './FormSelect';
import { ChangePasswordModal } from './ChangePasswordModal';

interface PrivacyTabProps {
  biometricsEnabled: boolean;
  cloudBackupEnabled: boolean;
  videoVisibility: string;
  onBiometricsChange: (enabled: boolean) => void;
  onCloudBackupChange: (enabled: boolean) => void;
  onVideoVisibilityChange: (visibility: string) => void;
  onLogout: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isChangingPassword?: boolean;
  showPasswordModal: boolean;
  onOpenPasswordModal: () => void;
  onClosePasswordModal: () => void;
}

const VIDEO_VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'private', label: 'Private' },
];

export function PrivacyTab({
  // biometricsEnabled,
  cloudBackupEnabled,
  videoVisibility,
  // onBiometricsChange,
  onCloudBackupChange,
  onVideoVisibilityChange,
  onLogout,
  onChangePassword,
  isChangingPassword = false,
  showPasswordModal,
  onOpenPasswordModal,
  onClosePasswordModal,
}: PrivacyTabProps) {
  return (
    <>
      <div className="space-y-6">
      {/* Biometrics Setting */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"> */}
        {/* <div>
          <h3 className="text-base font-medium text-text-primary mb-1">Use Biometrics</h3>
          <p className="text-sm text-text-muted">
            {biometricsEnabled ? 'Enabled' : 'Disabled'}
          </p>
          <p className="text-xs text-text-muted mt-1">Enable bio-metric authentication</p>
        </div> */}
        {/* <ToggleSwitch checked={biometricsEnabled} onChange={onBiometricsChange} />
      </div> */}

      <div className="border-b border-border/20" />

      {/* Cloud Backup Setting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-medium text-text-primary mb-1">
            Cloud Backup of uploads and purchases
          </h3>
          <p className={`text-sm ${cloudBackupEnabled ? 'text-primary' : 'text-text-muted'}`}>
            {cloudBackupEnabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <ToggleSwitch checked={cloudBackupEnabled} onChange={onCloudBackupChange} />
      </div>

      <div className="border-b border-border/20" />

      {/* Video Visibility Setting */}
      <div className="space-y-3">
        <FormSelect
          label="Who can watch my videos?"
          value={videoVisibility}
          onChange={(e) => onVideoVisibilityChange(e.target.value)}
          options={VIDEO_VISIBILITY_OPTIONS}
        />
      </div>

      <div className="border-b border-border/20" />

      {/* Password Setting */}
      <div>
        <h3 className="text-base font-medium text-text-primary mb-1">Password</h3>
        <button
          onClick={onOpenPasswordModal}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Change password?
        </button>
      </div>

      <div className="border-b border-border/20" />

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors w-fit"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>

    <ChangePasswordModal
      isOpen={showPasswordModal}
      onClose={onClosePasswordModal}
      onSubmit={onChangePassword}
      isLoading={isChangingPassword}
    />
  </>
  );
}
