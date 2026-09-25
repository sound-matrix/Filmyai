'use client';

import { useState, type FormEvent } from 'react';
import type { AccessRule } from '@filmyai/shared';

export default function NewFilmPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // UI-only stub — no Supabase writes in SOU-11
    setSubmitted(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">New film</h1>
      <p className="mb-8 text-studio-muted">Create form stub · no persistence yet</p>

      {submitted && (
        <div className="mb-6 rounded-md border border-amber-600/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          Form captured locally only. Supabase writes are out of scope for this scaffold.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title" name="title" required />
        <div>
          <label htmlFor="synopsis" className="mb-1 block text-sm text-studio-muted">
            Synopsis
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={4}
            required
            className="w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2 text-sm outline-none focus:border-studio-accent"
          />
        </div>
        <Field label="Genre" name="genre" required />
        <Field label="Poster path" name="poster" placeholder="/placeholders/poster.jpg" />
        <Field label="Backdrop path" name="backdrop" placeholder="/placeholders/backdrop.jpg" />
        <div>
          <label htmlFor="access_rule" className="mb-1 block text-sm text-studio-muted">
            Access rule
          </label>
          <select
            id="access_rule"
            name="access_rule"
            defaultValue={'public' satisfies AccessRule}
            className="w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2 text-sm outline-none focus:border-studio-accent"
          >
            <option value="public">public</option>
            <option value="members">members</option>
            <option value="paid">paid</option>
          </select>
        </div>
        <div>
          <label htmlFor="launch_date" className="mb-1 block text-sm text-studio-muted">
            Launch date
          </label>
          <input
            id="launch_date"
            name="launch_date"
            type="date"
            className="w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2 text-sm outline-none focus:border-studio-accent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" className="rounded border-zinc-600" />
          Publish immediately
        </label>
        <button
          type="submit"
          className="rounded-md bg-studio-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Save (stub)
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-studio-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2 text-sm outline-none focus:border-studio-accent"
      />
    </div>
  );
}
