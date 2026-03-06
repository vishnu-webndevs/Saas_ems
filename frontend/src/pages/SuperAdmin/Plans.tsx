import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansAPI, Plan } from '../../api/plans';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, CreditCard, Users, Folder } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export default function Plans() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  interface PlanFormData {
    name: string;
    description: string;
    price: number;
    duration_in_days: number;
    max_users: number;
    max_projects: number;
    is_active: boolean;
    features: Record<string, unknown>;
  }

  const initialFormState: PlanFormData = {
    name: '',
    description: '',
    price: 0,
    duration_in_days: 30,
    max_users: 0,
    max_projects: 0,
    is_active: true,
    features: {
      storage: '1GB',
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: plansAPI.getPlans,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Plan>) => plansAPI.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Plan created successfully');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message ?? 'Failed to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Plan> }) => 
      plansAPI.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Plan updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message ?? 'Failed to update plan');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: plansAPI.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message ?? 'Failed to delete plan');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: PlanFormData = {
      ...formData,
      // Ensure numeric values
      price: Number(formData.price),
      duration_in_days: Number(formData.duration_in_days),
      max_users: Number(formData.max_users),
      max_projects: Number(formData.max_projects),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      duration_in_days: plan.duration_in_days,
      max_users: plan.max_users,
      max_projects: plan.max_projects,
      is_active: plan.is_active,
      features: plan.features || { storage: '1GB' },
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData(initialFormState);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Subscription Plans
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage available subscription plans
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan: Plan) => (
          <div
            key={plan.id}
            className={`rounded-lg shadow-sm border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ${plan.price}
              <span className={`text-sm font-normal ml-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                /{plan.duration_in_days} days
              </span>
            </div>

            <p className={`mb-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {plan.description}
            </p>

            <div className="space-y-3 border-t pt-4 dark:border-gray-700">
              <div className="flex items-center text-sm">
                <Users className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {plan.max_users === 0 ? 'Unlimited' : plan.max_users} Users
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Folder className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {plan.max_projects === 0 ? 'Unlimited' : plan.max_projects} Projects
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CreditCard className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`w-full max-w-lg p-6 rounded-lg shadow-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duration
                  </label>
                  <div className="space-y-2">
                    <select
                      value={[30, 60, 180, 365].includes(formData.duration_in_days) ? formData.duration_in_days : 'custom'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          setFormData({ ...formData, duration_in_days: 0 });
                        } else {
                          setFormData({ ...formData, duration_in_days: parseInt(val) });
                        }
                      }}
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="180">6 Months</option>
                      <option value="365">1 Year</option>
                      <option value="custom">Custom Days</option>
                    </select>
                    {![30, 60, 180, 365].includes(formData.duration_in_days) && (
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Enter days"
                        value={formData.duration_in_days === 0 ? '' : formData.duration_in_days}
                        onChange={(e) => setFormData({ ...formData, duration_in_days: parseInt(e.target.value) || 0 })}
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Users (0 for unltd)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Max Projects (0 for unltd)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.max_projects}
                    onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
