'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Eye, Save, Upload } from 'lucide-react';
import { errorText, Media, Profile, request } from './api';
import { Heading, Loading, Notice } from './ui';

const fields = [
  ['fullName', 'Full name', 'text'],
  ['professionalTitle', 'Professional title', 'text'],
  ['headline', 'Headline', 'text'],
  ['location', 'Location', 'text'],
  ['specialization', 'Specialization', 'text'],
  ['availability', 'Availability', 'text'],
  ['publicEmail', 'Public email', 'email'],
  ['githubUrl', 'GitHub URL', 'url'],
  ['linkedinUrl', 'LinkedIn URL', 'url'],
  ['portraitUrl', 'Portrait URL', 'text'],
  ['resumeUrl', 'Resume PDF URL', 'text'],
  ['seoTitle', 'SEO title', 'text'],
];
export default function ProfileEditor() {
  const client = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState('');
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: () => request<Profile>('/admin/profile'),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const form = useForm<Record<string, string>>();
  useEffect(() => {
    if (query.data)
      form.reset(
        Object.fromEntries(
          Object.entries(query.data).map(([key, value]) => [
            key,
            value == null ? '' : String(value),
          ]),
        ),
      );
  }, [query.data, form]);
  const values = useWatch({ control: form.control });
  useEffect(() => {
    if (!form.formState.isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [form.formState.isDirty]);
  async function save(data: Record<string, string>) {
    setError('');
    setSuccess('');
    try {
      const payload = { ...data, version: query.data?.version };
      const updated = await request<Profile>('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      client.setQueryData(['profile'], updated);
      setSuccess('Profile saved. Your public introduction is up to date.');
    } catch (failure) {
      setError(errorText(failure));
    }
  }
  async function upload(file: File | undefined, target: string) {
    if (!file) return;
    setUploading(target);
    setError('');
    try {
      const data = new FormData();
      data.set('file', file);
      const asset = await request<Media>('/admin/media', { method: 'POST', body: data });
      form.setValue(target, asset.url, { shouldDirty: true });
      setSuccess('Upload complete. Save your profile to apply it.');
    } catch (failure) {
      setError(errorText(failure));
    } finally {
      setUploading('');
    }
  }
  return (
    <>
      <Heading
        code="PROFILE_CONFIG"
        title="Your introduction"
        description="Keep the story behind your work accurate and up to date."
      >
        <button className="admin-button secondary" onClick={() => setPreview(!preview)}>
          <Eye size={16} />
          {preview ? 'Edit profile' : 'Preview'}
        </button>
      </Heading>
      <Notice
        error={error || (query.error ? errorText(query.error) : undefined)}
        success={success}
      />
      {query.isPending ? (
        <Loading />
      ) : (
        query.data &&
        (preview ? (
          <section className="admin-panel admin-profile-preview">
            <span className="admin-eyebrow">{'// PUBLIC_PROFILE_PREVIEW'}</span>
            <h2>{values.fullName}</h2>
            <h3>{values.professionalTitle}</h3>
            <p className="admin-accent">{values.headline}</p>
            <p>{values.shortBio}</p>
            <p>{values.fullBio}</p>
            <p>
              {values.location} · {values.availability || 'Availability not specified'}
            </p>
          </section>
        ) : (
          <form className="admin-panel admin-form" onSubmit={form.handleSubmit(save)}>
            <div className="admin-form-grid">
              {fields.map(([name, label, type]) => (
                <label key={name}>
                  {label}
                  <input
                    type={type}
                    {...form.register(name, {
                      required: ['fullName', 'professionalTitle', 'headline'].includes(name),
                      maxLength: 1000,
                    })}
                  />
                  <span className="admin-field-error">
                    {form.formState.errors[name] &&
                      `${label} is required and must be within 1000 characters.`}
                  </span>
                </label>
              ))}
            </div>
            <label>
              Short biography
              <textarea rows={3} maxLength={2000} {...form.register('shortBio')} />
            </label>
            <label>
              Full biography
              <textarea rows={7} maxLength={20000} {...form.register('fullBio')} />
            </label>
            <label>
              SEO description
              <textarea rows={2} maxLength={320} {...form.register('seoDescription')} />
            </label>
            <div className="admin-upload-row">
              <label className="admin-button secondary">
                <Upload size={15} />
                {uploading === 'portraitUrl' ? 'Uploading…' : 'Upload portrait'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={!!uploading}
                  onChange={(event) => upload(event.target.files?.[0], 'portraitUrl')}
                  hidden
                />
              </label>
              <label className="admin-button secondary">
                <Upload size={15} />
                {uploading === 'resumeUrl' ? 'Uploading…' : 'Upload resume'}
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={!!uploading}
                  onChange={(event) => upload(event.target.files?.[0], 'resumeUrl')}
                  hidden
                />
              </label>
            </div>
            <div className="admin-form-footer">
              <span>{form.formState.isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
              <button
                className="admin-button"
                type="submit"
                disabled={form.formState.isSubmitting || !!uploading}
              >
                <Save size={16} />
                {form.formState.isSubmitting ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        ))
      )}
    </>
  );
}
