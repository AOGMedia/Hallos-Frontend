import type { User } from '@/types/auth';
import { apiClient } from './client';
import { authApi } from './auth';

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.get('/auth/me');
    const responseData = response.data as unknown;
    // Handle response structure: { success: true, data: { ...userFields } }
    const raw = (responseData as { data?: unknown }).data ?? 
                (responseData as { user?: unknown }).user ?? 
                responseData;
    const r = raw as Record<string, unknown>;
    const idVal = (r.id ?? r._id) as string | number | undefined;
    const email = (r.email ?? r.emailAddress ?? r.email_address) as string | undefined;
    let firstname = (r.firstname ?? r.firstName ?? r.first_name) as string | undefined;
    let lastname = (r.lastname ?? r.lastName ?? r.last_name) as string | undefined;
    const role = (r.role) as string | undefined;
    const name = (r.name ?? r.fullName) as string | undefined;
    if ((!firstname || !lastname) && name) {
      const parts = name.split(' ');
      firstname = firstname ?? parts[0];
      lastname = lastname ?? (parts.length > 1 ? parts.slice(1).join(' ') : '');
    }
    return {
      id: idVal !== undefined ? String(idVal) : (email ? `email:${email}` : 'unknown'),
      email: email ?? '',
      firstname: firstname ?? '',
      lastname: lastname ?? '',
      role: role,
    };
  } catch {
    const res = await authApi.me();
    return res.user;
  }
}