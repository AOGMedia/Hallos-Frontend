'use client';

import { useEffect, useState } from 'react';
import { quizAdminService, QuizCategory } from '@/services/quizAdminService';

export function useQuizCategories() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    quizAdminService.getCategories()
      .then((res) => {
        if (res.success) setCategories(res.categories);
      })
      .catch((err) => setError(err.message ?? 'Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}
