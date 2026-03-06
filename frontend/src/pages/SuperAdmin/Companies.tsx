import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useTheme } from '../../hooks/useTheme';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Search, Edit2, Trash2, Building, X } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface Company {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  plan: string;
  status: 'active' | 'suspended';
  created_at: string;
  users_count?: number;
}

type CreateCompanyPayload = {
  name: string;
  email: string;
  phone: string;
  plan: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
};

type UpdateCompanyPayload = {
  name: string;
  email: string;
  phone: string;
  plan: string;
};

export default function Companies() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'free',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });

  const { data: companies, isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/superadmin/companies');
      return response.data as Company[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyPayload) => api.post('/superadmin/companies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Company created successfully');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message ?? 'Failed to create company');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompanyPayload }) =>
      api.put(`/superadmin/companies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsModalOpen(false);
      resetForm();
      toast.success('Company updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message ?? 'Failed to update company');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/superadmin/companies/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Company deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      plan: 'free',
      admin_name: '',
      admin_email: '',
      admin_password: '',
    });
    setEditingCompany(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      const updateData: UpdateCompanyPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        plan: formData.plan,
      };
      updateMutation.mutate({ id: editingCompany.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      email: company.email || '',
      phone: company.phone || '',
      plan: company.plan,
      admin_name: '', // Not editable here
      admin_email: '', // Not editable here
      admin_password: '', // Not editable here
    });
    setIsModalOpen(true);
  };

  const filteredCompanies = companies?.filter((company: Company) => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Companies
          </h1>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage tenant companies and their subscriptions
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Company
        </button>
      </div>

      <div className={`p-4 rounded-lg shadow-sm border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies?.map((company: Company) => (
          <div
            key={company.id}
            className={`rounded-lg shadow-sm border p-6 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <Building className="w-6 h-6" />
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {company.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {company.email}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                company.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {company.status}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Plan</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {company.plan.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Users</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {company.users_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Created</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(company.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleEdit(company)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
                    deleteMutation.mutate(company.id);
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-50 text-red-500 hover:text-red-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsModalOpen(false)}></div>
            <div className={`relative w-full max-w-md p-6 rounded-lg shadow-xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingCompany ? 'Edit Company' : 'New Company'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company Name
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
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Plan
                  </label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {!editingCompany && (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Company Admin
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Admin Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.admin_name}
                            onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Admin Email
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.admin_email}
                            onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Admin Password
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={formData.admin_password}
                            onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      theme === 'dark' 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingCompany ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
