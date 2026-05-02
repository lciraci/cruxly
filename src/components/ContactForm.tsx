'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

interface ContactFormProps {
  type: 'general' | 'privacy';
  title?: string;
  description?: string;
}

export default function ContactForm({ type, title, description }: ContactFormProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle size={32} className="text-amber-400" />
        <p className="font-semibold text-zinc-100">Message received</p>
        <p className="text-sm text-zinc-400">We&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <div>
      {title && <p className="text-sm font-semibold text-zinc-300 mb-1">{title}</p>}
      {description && <p className="text-sm text-zinc-500 mb-5">{description}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
          />
          <input
            required
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors"
          />
        </div>
        <textarea
          required
          rows={4}
          placeholder="Your message"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          className="px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400/40 transition-colors resize-none"
        />

        {status === 'error' && (
          <p className="text-xs text-red-400">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="self-start flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-900 text-sm font-semibold rounded-lg transition-colors"
        >
          <Send size={14} />
          {status === 'loading' ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
