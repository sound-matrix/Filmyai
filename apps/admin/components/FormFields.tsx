'use client';

import Link from 'next/link';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const control =
  'w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2.5 text-sm outline-none focus:border-studio-accent min-h-11';

export function Field({
  label,
  name,
  hint,
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-studio-muted">
        {label}
      </label>
      <input id={name} name={name} className={control} {...props} />
      {hint ? <p className="mt-1 text-xs text-studio-muted">{hint}</p> : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  hint,
  ...props
}: {
  label: string;
  name: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-studio-muted">
        {label}
      </label>
      <textarea id={name} name={name} className={`${control} min-h-[6rem]`} {...props} />
      {hint ? <p className="mt-1 text-xs text-studio-muted">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  children,
  ...props
}: {
  label: string;
  name: string;
  children: React.ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm text-studio-muted">
        {label}
      </label>
      <select id={name} name={name} className={control} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Flash({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-md border border-amber-600/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-11 items-center rounded-md bg-studio-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center rounded-md border border-red-800/60 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-4 py-2 text-sm text-studio-muted hover:border-zinc-500 hover:text-white"
    >
      {children}
    </Link>
  );
}
