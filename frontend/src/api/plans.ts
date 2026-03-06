import { api } from '../lib/api';

export interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_in_days: number;
  features: any;
  max_users: number;
  max_projects: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const plansAPI = {
  getPlans: async () => {
    const response = await api.get('/superadmin/plans');
    return response.data;
  },

  getPlan: async (id: number) => {
    const response = await api.get(`/superadmin/plans/${id}`);
    return response.data;
  },

  createPlan: async (data: Partial<Plan>) => {
    const response = await api.post('/superadmin/plans', data);
    return response.data;
  },

  updatePlan: async (id: number, data: Partial<Plan>) => {
    const response = await api.put(`/superadmin/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: number) => {
    const response = await api.delete(`/superadmin/plans/${id}`);
    return response.data;
  },
};
