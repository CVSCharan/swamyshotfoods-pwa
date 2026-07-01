import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, setError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      alert('Please enter username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
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
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              autoComplete="username"
              leftIcon={UserIcon}
              disabled={loading}
              placeholder="Enter username"
            />

            <Input
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              leftIcon={Lock}
              disabled={loading}
              placeholder="Enter password"
            />

            {error && (
              <div className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-xl">
                {error}
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
