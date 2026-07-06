import { Edit, X } from 'lucide-react';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface ProfileHeaderProps {
  fullName: string;
  email: string;
  avatarUrl?: string;
  isEditing: boolean;
  onEditProfile: () => void;
  onUploadPicture: (file: File) => Promise<void>;
  isUploadingPicture?: boolean;
}

export function ProfileHeader({ fullName, email, avatarUrl, isEditing, onEditProfile, onUploadPicture, isUploadingPicture = false }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
      <div className="flex items-center gap-4 flex-1">
        <ProfilePictureUpload
          currentPictureUrl={avatarUrl}
          onUpload={onUploadPicture}
          isUploading={isUploadingPicture}
        />
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">{fullName}</h1>
          <p className="text-sm text-text-muted">{email}</p>
        </div>
      </div>

      <button
        onClick={onEditProfile}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors text-sm ${
          isEditing 
            ? 'border-red-500 text-red-500 hover:bg-red-500/10' 
            : 'border-border hover:bg-background-dark/50'
        }`}
      >
        {isEditing ? <X size={16} /> : <Edit size={16} />}
        <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
      </button>
    </div>
  );
}
