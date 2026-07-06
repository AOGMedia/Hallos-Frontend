import { create } from 'zustand';
// import type { RegistrationFormData } from '../components/event/types';
import { EventRegisterPayload } from '@/components/event/types';

interface EventStore {
  formData: Partial<EventRegisterPayload>;
  setFormData: (data: Partial<EventRegisterPayload>) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const useEventStore = create<EventStore>((set) => ({
  formData: {},
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  isModalOpen: false,
  setIsModalOpen: (open) => set({ isModalOpen: open }),
}));
