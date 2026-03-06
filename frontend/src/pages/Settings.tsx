import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { authAPI } from '../api/auth';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [savingPwd, setSavingPwd] = useState(false);

  const title = user?.role === 'superadmin' ? 'Super Admin Settings' : 'Settings';
  const subtitle =
    user?.role === 'superadmin'
      ? 'Configure global preferences and appearance'
      : 'Manage your preferences and appearance';

  const onSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await authAPI.updateProfile({
        name: profile.name,
        email: profile.email,
      });
      updateUser({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      const msg = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0][0]
        : e.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.password !== pwd.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setSavingPwd(true);
      await authAPI.updatePassword(pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Password updated');
    } catch (err: unknown) {
      const e = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      const msg = e.response?.data?.errors
        ? Object.values(e.response.data.errors)[0][0]
        : e.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Switch between light and dark themes
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{theme}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Toggle Theme
            </button>
          </div>
        </div>

        <form
          onSubmit={onSubmitProfile}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your basic details</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <form
        onSubmit={onSubmitPassword}
        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Set a strong, unique password
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Current Password
            </label>
            <input
              type="password"
              required
              value={pwd.current_password}
              onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwd.password}
              onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={pwd.password_confirmation}
              onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={savingPwd}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingPwd ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
