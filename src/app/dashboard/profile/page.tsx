'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/api/profile';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { GeneralTab } from '@/components/profile/GeneralTab';
import { PrivacyTab } from '@/components/profile/PrivacyTab';
import { ReferralsTab } from '@/components/profile/ReferralsTab';
// import { AgenciesTab } from '@/components/profile/AgenciesTab';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'privacy', label: 'Privacy & Security' },
  { id: 'referrals', label: 'Referrals' },
  // { id: 'agencies', label: 'For Agencies', isNew: true },
];

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  
  // General tab state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('male');
  
  // Privacy tab state
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(true);
  const [videoVisibility, setVideoVisibility] = useState('everyone');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data);
      setIsEditing(false);
      // Show success message (you can add a toast notification here)
      console.log('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      // Show error message (you can add a toast notification here)
    },
  });

  const uploadPictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const { uploadProfilePicture } = await import('@/lib/api/profile');
      return uploadProfilePicture(file);
    },
    onSuccess: (profilePictureUrl) => {
      // console.log('Profile picture updated successfully:', profilePictureUrl);
      
      // Update the cache with the new picture URL
      queryClient.setQueryData(['user-profile'], (old: unknown) => {
        const oldProfile = old as { socialLinks?: { profilePicture?: string } } | undefined;
        const updated = {
          ...oldProfile,
          socialLinks: {
            ...oldProfile?.socialLinks,
            profilePicture: profilePictureUrl,
          },
        };
        // console.log('Updated profile cache:', updated);
        return updated;
      });
      
      // Don't refetch immediately since the backend doesn't return the profilePicture yet
      // The optimistic update above will keep the image displayed
    },
    onError: (error) => {
      console.error('Failed to upload profile picture:', error);
    },
  });

  const handleUploadPicture = useCallback(async (file: File) => {
    await uploadPictureMutation.mutateAsync(file);
  }, [uploadPictureMutation]);

  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { changePassword } = await import('@/lib/api/profile');
      return changePassword({ currentPassword, newPassword });
    },
    onSuccess: (message) => {
      console.log('Password changed successfully:', message);
      // Don't close modal here - let the modal handle it after showing success message
    },
    onError: (error: Error) => {
      console.error('Failed to change password:', error);
      throw error; // Re-throw to let the modal handle it
    },
  });

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
  }, [changePasswordMutation]);

  // Generate display name from email and firstname
  const generateDisplayName = useCallback((email: string, firstname: string) => {
    if (firstname) {
      return `@${firstname.toLowerCase()}`;
    }
    if (email) {
      const username = email.split('@')[0];
      return `@${username}`;
    }
    return '';
  }, []);

  // Initialize form fields with profile data
  useEffect(() => {
    if (profile) {
      // console.log('Profile data:', profile);
      // console.log('Profile picture URL:', profile?.socialLinks?.profilePicture);
      setFirstName(profile.firstname || '');
      setLastName(profile.lastname || '');
      setEmail(profile.email || '');
      setPhoneNumber(profile.phoneNumber || '');
      setBio(profile.bio || '');
      setLocation(profile.country || '');
      setNewsletterSubscribed(profile.newsletterSubscribed || false);
      
      // Auto-generate display name if not set
      if (!displayName && (profile.email || profile.firstname)) {
        setDisplayName(generateDisplayName(profile.email, profile.firstname));
      }
    }
  }, [profile, displayName, generateDisplayName]);

  const fullName = (firstName || lastName) 
    ? `${firstName} ${lastName}`.trim()
    : 'User';

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push('/signin');
  }, [clearAuth, router]);

  const handleSaveChanges = useCallback(() => {
    updateProfileMutation.mutate({
      firstname: firstName,
      lastname: lastName,
      phoneNumber: phoneNumber,
      country: location,
      bio: bio,
      newsletterSubscribed: newsletterSubscribed,
    });
  }, [firstName, lastName, phoneNumber, location, bio, newsletterSubscribed, updateProfileMutation]);

  const handleEditProfile = useCallback(() => {
    if (isEditing) {
      // Reset to original values if canceling
      if (profile) {
        setFirstName(profile.firstname || '');
        setLastName(profile.lastname || '');
        setPhoneNumber(profile.phoneNumber || '');
        setBio(profile.bio || '');
        setLocation(profile.country || '');
        setNewsletterSubscribed(profile.newsletterSubscribed || false);
      }
    }
    setIsEditing(!isEditing);
  }, [isEditing, profile]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'displayName':
        setDisplayName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'bio':
        setBio(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'gender':
        setGender(value);
        break;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-darker text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-darker text-text-primary">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <ProfileHeader
          fullName={fullName}
          email={email}
          avatarUrl={profile?.socialLinks?.profilePicture}
          isEditing={isEditing}
          onEditProfile={handleEditProfile}
          onUploadPicture={handleUploadPicture}
          isUploadingPicture={uploadPictureMutation.isPending}
        />

        <ProfileTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex flex-col lg:flex-row gap-6">
          <Card variant="default" className="flex-1 min-w-0 overflow-hidden p-4 sm:p-6">
            {activeTab === 'general' && (
              <GeneralTab
                firstName={firstName}
                lastName={lastName}
                displayName={displayName}
                email={email}
                phoneNumber={phoneNumber}
                bio={bio}
                location={location}
                gender={gender}
                newsletterSubscribed={newsletterSubscribed}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
                onNewsletterChange={setNewsletterSubscribed}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyTab
                biometricsEnabled={biometricsEnabled}
                cloudBackupEnabled={cloudBackupEnabled}
                videoVisibility={videoVisibility}
                onBiometricsChange={setBiometricsEnabled}
                onCloudBackupChange={setCloudBackupEnabled}
                onVideoVisibilityChange={setVideoVisibility}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
                isChangingPassword={changePasswordMutation.isPending}
                showPasswordModal={showPasswordModal}
                onOpenPasswordModal={() => setShowPasswordModal(true)}
                onClosePasswordModal={() => setShowPasswordModal(false)}
              />
            )}

            {activeTab === 'referrals' && <ReferralsTab />}

            {/* {activeTab === 'agencies' && <AgenciesTab />} */}
          </Card>

          <div className="lg:w-auto">
            <button
              onClick={handleSaveChanges}
              disabled={!isEditing || updateProfileMutation.isPending}
              className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}