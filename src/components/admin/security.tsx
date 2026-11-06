'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { errorText, request } from './api';
import { Heading, Notice } from './ui';

const schema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    new_password: z
      .string()
      .min(14, 'Use at least 14 characters.')
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        'Use at most 72 UTF-8 bytes.',
      ),
    confirmPassword: z.string(),
  })
  .refine((value) => value.new_password === value.confirmPassword, {
    message: 'Passwords must match.',
    path: ['confirmPassword'],
  });
type Values = z.infer<typeof schema>;
export default function Security() {
  const router = useRouter();
  const client = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  async function save(values: Values) {
    setError('');
    setSuccess('');
    try {
      await request('/admin/auth/password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: values.current_password,
          new_password: values.new_password,
        }),
      });
      form.reset();
      client.clear();
      setSuccess('Password updated. Sign in again with your new password.');
      router.replace('/admin/login');
      router.refresh();
    } catch (failure) {
      setError(errorText(failure));
    }
  }
  return (
    <>
      <Heading
        code="ACCOUNT_SECURITY"
        title="Keep your console secure"
        description="Manage your administrator credentials and session."
      />
      <Notice error={error} success={success} />
      <div className="admin-dashboard-grid">
        <form className="admin-panel admin-form" onSubmit={form.handleSubmit(save)}>
          <h2>
            <LockKeyhole size={18} /> Change password
          </h2>
          <label>
            Current password
            <input
              {...form.register('current_password')}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {form.formState.errors.current_password && (
            <p className="admin-field-error">{form.formState.errors.current_password.message}</p>
          )}
          <label>
            New password
            <input {...form.register('new_password')} type="password" autoComplete="new-password" />
          </label>
          {form.formState.errors.new_password && (
            <p className="admin-field-error">{form.formState.errors.new_password.message}</p>
          )}
          <label>
            Confirm new password
            <input
              {...form.register('confirmPassword')}
              type="password"
              autoComplete="new-password"
            />
          </label>
          {form.formState.errors.confirmPassword && (
            <p className="admin-field-error">{form.formState.errors.confirmPassword.message}</p>
          )}
          <p className="admin-hint">
            Use a unique passphrase of at least 14 characters and no more than 72 UTF-8 bytes. You
            will need to sign in again.
          </p>
          <button className="admin-button" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <section className="admin-panel admin-security-note">
          <ShieldCheck size={30} />
          <h2>Protection at every layer</h2>
          <ul>
            <li>Server-enforced administrator authorization</li>
            <li>HTTP-only session cookies</li>
            <li>CSRF protection on state changes</li>
            <li>Adaptive password hashing</li>
            <li>Login throttling and audit history</li>
          </ul>
          <p>
            Sign out when you finish on a shared device. Production deployments must use HTTPS and
            secure cookies.
          </p>
        </section>
      </div>
    </>
  );
}
