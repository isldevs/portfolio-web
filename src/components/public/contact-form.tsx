'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { request } from '@/lib/api';
const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Please enter a valid email address.').max(254),
  subject: z.string().trim().min(3, 'Please add a subject.').max(200),
  message: z.string().trim().min(10, 'Please write at least 10 characters.').max(5000),
  website: z.string().max(200),
});
type Fields = z.infer<typeof schema>;
export function ContactForm() {
  const [sent, setSent] = useState(false),
    [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema), defaultValues: { website: '' } });
  async function submit(values: Fields) {
    setError('');
    try {
      await request('/public/contact', { method: 'POST', body: JSON.stringify(values) });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Message could not be sent. Please retry.');
    }
  }
  if (sent)
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={27} />
        <h2>Message received.</h2>
        <p>Thank you for reaching out. Your message is now in the inbox.</p>
        <button className="button-secondary" onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contact-name">Your name *</label>
          <input
            id="contact-name"
            autoComplete="name"
            className="field"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            maxLength={100}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" className="field-error">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">Email address *</label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            className="field"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            maxLength={254}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="contact-subject">Subject *</label>
        <input
          id="contact-subject"
          className="field"
          placeholder="What are you working on?"
          maxLength={200}
          aria-invalid={!!errors.subject}
          {...register('subject')}
        />
        {errors.subject && <p className="field-error">{errors.subject.message}</p>}
      </div>
      <div className="form-group">
        <label htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          className="field"
          rows={7}
          placeholder="Tell me about the challenge, the context, and how I can help..."
          maxLength={5000}
          aria-invalid={!!errors.message}
          {...register('message')}
        />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>
      <div style={{ position: 'absolute', left: -9999 }} aria-hidden="true">
        <label htmlFor="contact-website">Leave this blank</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button type="submit" className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Sending message…' : 'Send message'}
        <ArrowUpRight size={15} />
      </button>
      <p className="form-note">
        Your details are used to respond to this message and are visible only to the portfolio
        administrator.
      </p>
    </form>
  );
}
