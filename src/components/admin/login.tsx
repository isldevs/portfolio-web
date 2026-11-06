'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import { errorText, request } from './api';
import { Notice } from './ui';

const schema = z.object({
  username: z.string().min(1, 'Enter your username.').max(100),
  password: z.string().min(1, 'Enter your password.').max(200),
});
type LoginValues = z.infer<typeof schema>;
export default function Login() {
  const router = useRouter();
  const client = useQueryClient();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(schema) });
  async function submit(values: LoginValues) {
    setError('');
    try {
      await request('/admin/auth/login', { method: 'POST', body: JSON.stringify(values) });
      client.clear();
      router.replace('/admin');
      router.refresh();
    } catch (failure) {
      setError(errorText(failure));
    }
  }
  return (
    <main className="admin-login">
      <Link className="admin-brand" href="/">
        <span>&lt;/&gt;</span> YI SIVLAY
      </Link>
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <LockKeyhole size={25} />
        </div>
        <p className="admin-eyebrow">{'// SECURE_ACCESS'}</p>
        <h1>
          Welcome back<span className="admin-accent">.</span>
        </h1>
        <p>Authenticate to manage your portfolio.</p>
        <Notice error={error} />
        <form onSubmit={handleSubmit(submit)} noValidate>
          <label>
            Username
            <input
              {...register('username')}
              autoComplete="username"
              autoFocus
              aria-invalid={!!errors.username}
            />
          </label>
          {errors.username && <p className="admin-field-error">{errors.username.message}</p>}
          <label>
            Password
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
            />
          </label>
          {errors.password && <p className="admin-field-error">{errors.password.message}</p>}
          <button className="admin-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating…' : 'Sign in to console'}
            <ArrowRight size={16} />
          </button>
        </form>
        <p className="admin-login-note">
          Session based authentication. Credentials are never stored in your browser.
        </p>
      </div>
      <Link className="admin-back" href="/">
        ← Back to portfolio
      </Link>
    </main>
  );
}
