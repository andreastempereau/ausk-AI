"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-supabase';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectMessage?: string;
  redirectPath?: string;
}

export function LoginForm({ redirectMessage, redirectPath }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading: authLoading, loadingStage, error, clearError } = useAuth();
  
  // Use auth context loading for OAuth, form state for regular sign in
  const isLoading = formSubmitting || (authLoading && loadingStage !== 'initializing');

  // Debug: log the loading state
  console.log('LoginForm loading states:', { formSubmitting, authLoading, loadingStage, isLoading });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = redirectPath || '/app';
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirectPath]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('=== LOGIN FORM onSubmit START ===');
    setFormSubmitting(true);
    clearError();

    try {
      console.log('onSubmit: About to call signIn with:', { email: data.email, rememberMe: data.rememberMe });
      await signIn(data.email, data.password, data.rememberMe);
      console.log('onSubmit: signIn completed successfully, await finished');
      // Redirect will happen automatically via useEffect
    } catch (error) {
      console.log('onSubmit: signIn failed with error:', error);
      setFormSubmitting(false); // Only set false on error, success will redirect
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('email', { message: 'Invalid email or password' });
          setError('password', { message: 'Invalid email or password' });
        } else if (error.message.includes('Email not confirmed')) {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        } else {
          setError('email', { message: error.message });
        }
      }
    }
    console.log('=== LOGIN FORM onSubmit END ===');
  };


  return (
    <div className="space-y-6">
      {/* Redirect message */}
      {redirectMessage && (
        <div className="rounded-lg bg-warning-50 border border-warning-200 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning-600" />
            <p className="text-sm text-warning-700">
              {redirectMessage}
            </p>
          </div>
        </div>
      )}


      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email address
          </label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            className={cn(errors.email && 'border-destructive focus:border-destructive focus:ring-destructive')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(
                'pr-10',
                errors.password && 'border-destructive focus:border-destructive focus:ring-destructive'
              )}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary/80"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Auth Error */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <a
          href="/register"
          className="font-medium text-primary hover:text-primary/80"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}