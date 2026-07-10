import React, { useState } from 'react';
import { User as UserIcon, Lock, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const addUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'staff', 'user']),
  pic: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export const AddUser: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      pic: '',
    },
  });

  const onSubmit = async (data: AddUserFormValues) => {
    setSuccessMsg(null);
    setApiError(null);
    setLoading(true);

    try {
      await authService.register({
        username: data.username.trim(),
        password: data.password,
        role: data.role,
        ...(data.pic?.trim() ? { pic: data.pic.trim() } : {}),
      });

      setSuccessMsg(`User "${data.username}" has been successfully added with the role of ${data.role}!`);
      
      reset();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in space-y-6">
      
      <div className="text-center md:text-left">
        <h1 className="font-display font-black text-2xl text-neutral-900 mb-1">
          User Management
        </h1>
        <p className="text-sm text-neutral-500 font-medium">
          Create new administrative or staff accounts for the system
        </p>
      </div>

      <Card className="p-1">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Enter details below to create a login account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {successMsg && (
              <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 rounded-xl">
                {successMsg}
              </div>
            )}

            {apiError && (
              <div className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/25 px-4 py-3 rounded-xl flex items-center gap-2">
                <ShieldAlert size={16} />
                {apiError}
              </div>
            )}

            <Input
              label="Username *"
              {...register('username')}
              error={errors.username?.message}
              autoCapitalize="none"
              leftIcon={UserIcon}
              placeholder="E.g. Chefswamy"
              disabled={loading}
            />

            <Input
              label="Password *"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              leftIcon={Lock}
              placeholder="Min 6 characters"
              disabled={loading}
            />

            <Input
              label="Confirm Password *"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              leftIcon={Lock}
              placeholder="Confirm password"
              disabled={loading}
            />

            {/* Role Dropdown */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase">
                System Role *
              </label>
              <select
                {...register('role')}
                disabled={loading}
                className="w-full px-4 py-3 glass-input rounded-xl text-sm bg-white border border-neutral-200 text-neutral-900 focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="user" className="bg-white">User (Standard)</option>
                <option value="staff" className="bg-white">Staff (Chef / Crew)</option>
                <option value="admin" className="bg-white">Admin (Owner)</option>
              </select>
              {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
            </div>

            <Input
              label="Profile Picture URL (Optional)"
              {...register('pic')}
              error={errors.pic?.message}
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
