import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error: storeError, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.username.trim(), data.password);
      navigate('/');
    } catch (err: any) {
      console.error('❌ Login error:', err);
      // Error will be set in the store or caught here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-saffron-500/20 shadow-2xl flex items-center justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-display font-black text-3xl text-saffron-500 tracking-tight">
          Swamy's Hot Foods
        </h1>
        <p className="text-xs text-neutral-500 font-semibold tracking-widest uppercase mt-1">
          Admin Portal
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border border-neutral-200 p-1 animate-slide-up">
        <CardHeader>
          <CardTitle className="text-xl font-extrabold text-neutral-900 font-display">Welcome Back</CardTitle>
          <CardDescription>Sign in to manage your shop, status, and menu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Username"
              {...register('username')}
              error={errors.username?.message}
              autoCapitalize="none"
              autoComplete="username"
              leftIcon={UserIcon}
              disabled={loading}
              placeholder="Enter username"
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              autoCapitalize="none"
              autoComplete="current-password"
              leftIcon={Lock}
              disabled={loading}
              placeholder="Enter password"
            />

            {storeError && (
              <div className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-xl">
                {storeError}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full py-3"
            >
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-neutral-400 font-medium">
        Swamy's Hot Foods © 2026
      </footer>
    </div>
  );
};
