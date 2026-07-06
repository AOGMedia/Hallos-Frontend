import { apiClient } from './client';

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  profilePicture?: string;
}

export interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  newsletterSubscribed?: boolean;
  role?: string;
  createdAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  profile: UserProfile;
}

export interface UpdateProfileRequest {
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  country?: string;
  bio?: string;
  socialLinks?: Partial<SocialLinks>;
  newsletterSubscribed?: boolean;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  profile: UserProfile;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  message: string;
  profilePictureUrl: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Get user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ProfileResponse>('/api/profile');
  return response.data.profile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await apiClient.patch<UpdateProfileResponse>('/api/profile', data);
  return response.data.profile;
}

/**
 * Upload/Update profile picture
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const response = await apiClient.post<UploadProfilePictureResponse>(
    '/api/profile/picture',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.profilePictureUrl;
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<string> {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/api/profile/change-password',
    data
  );
  return response.data.message;
}
