import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/api/users';
import type { User } from '@/types/auth';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        setError(null);
        // console.log('User fetched successfully:', userData.id, userData.email);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { 
    user, 
    loading, 
    error, 
    userId: user?.id,
    userEmail: user?.email,
    userFirstName: user?.firstname,
    userLastName: user?.lastname
  };
}