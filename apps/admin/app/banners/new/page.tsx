'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  Field,
  Flash,
  GhostLink,
  PrimaryButton,
} from '../../../components/FormFields';
import { useStudio } from '../../../components/StudioProvider';

export default function NewBannerPage() {
  const { createBanner, banners } = useStudio();
  const router = useRouter();
  const [flash, setFlash] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createBanner({
      title: String(fd.get('title') || ''),
      image_path: String(fd.get('image_path') || ''),
      active: fd.get('active') === 'on',
      sort_order: Number(fd.get('sort_order') || banners.length + 1),
    });
    setFlash(true);
    router.push('/banners');
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">New banner</h1>
      <p className="mb-8 text-studio-muted">Local shell only · path/text refs · no binary upload</p>
      {flash ? <Flash>Banner saved in local studio state.</Flash> : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title" name="title" required />
        <Field
          label="Image path"
          name="image_path"
          placeholder="/placeholders/banner.jpg"
          hint="Text/path reference only — no Drive or file upload"
        />
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={banners.length + 1}
          required
        />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked className="rounded border-zinc-600" />
          Active
        </label>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton>Create banner</PrimaryButton>
          <GhostLink href="/banners">Cancel</GhostLink>
        </div>
      </form>
    </div>
  );
}
