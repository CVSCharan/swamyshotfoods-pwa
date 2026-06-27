import React, { useState } from 'react';
import { User as UserIcon, Lock, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const AddUser: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pic, setPic] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'user'>('user');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.register({
        username: username.trim(),
        password,
        role,
        ...(pic.trim() && { pic: pic.trim() }),
      });

      setSuccessMsg(`User "${username}" has been successfully added with the role of ${role}!`);
      
      // Reset Form
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setPic('');
      setRole('user');
      setErrors({});
    } catch (err: any) {
      console.error(err);
      setErrors({ api: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-6">
      
      <div className="text-center md:text-left">
        <h1 className="font-display font-black text-2xl text-stone-100 mb-1">
          User Management
        </h1>
        <p className="text-sm text-stone-400 font-medium">
          Create new administrative or staff accounts for the system
        </p>
      </div>

      <Card className="p-1">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Enter details below to create a login account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            {successMsg && (
              <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 rounded-xl">
                {successMsg}
              </div>
            )}

            {errors.api && (
              <div className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/25 px-4 py-3 rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} />
                {errors.api}
              </div>
            )}

            <Input
              label="Username *"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors({ ...errors, username: '' });
              }}
              error={errors.username}
              autoCapitalize="none"
              leftIcon={UserIcon}
              placeholder="E.g. Chefswamy"
              disabled={loading}
            />

            <Input
              label="Password *"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              leftIcon={Lock}
              placeholder="Min 6 characters"
              disabled={loading}
            />

            <Input
              label="Confirm Password *"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              leftIcon={Lock}
              placeholder="Confirm password"
              disabled={loading}
            />

            {/* Role Dropdown */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-stone-300 font-display tracking-wide uppercase">
                System Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                disabled={loading}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm bg-stone-900 border border-stone-800 text-stone-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="user" className="bg-stone-950">User (Standard)</option>
                <option value="staff" className="bg-stone-950">Staff (Chef / Crew)</option>
                <option value="admin" className="bg-stone-950">Admin (Owner)</option>
              </select>
            </div>

            <Input
              label="Profile Picture URL (Optional)"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              leftIcon={ImageIcon}
              placeholder="Https://example.com/avatar.jpg"
              disabled={loading}
            />

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full py-3 mt-2"
            >
              Register User
            </Button>
          </form>
        </CardContent>
      </Card>
      
    </div>
  );
};
