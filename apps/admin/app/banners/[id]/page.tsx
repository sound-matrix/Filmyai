'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  DangerButton,
  Field,
  Flash,
  GhostLink,
  PrimaryButton,
} from '../../../components/FormFields';
import { useStudio } from '../../../components/StudioProvider';

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const { banners, updateBanner, deleteBanner } = useStudio();
  const banner = banners.find((b) => b.id === id);
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  if (!banner) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold">Banner not found</h1>
        <p className="mb-6 text-studio-muted">It may have been deleted from local state.</p>
        <GhostLink href="/banners">Back to banners</GhostLink>
      </div>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateBanner(banner!.id, {
      title: String(fd.get('title') || ''),
      image_path: String(fd.get('image_path') || ''),
      active: fd.get('active') === 'on',
      sort_order: Number(fd.get('sort_order') || 0),
    });
    setSaved(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Edit banner</h1>
      <p className="mb-8 text-studio-muted">Local shell · id {banner.id}</p>
      {saved ? <Flash>Updated in local studio state (no Supabase write).</Flash> : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title" name="title" required defaultValue={banner.title} />
        <Field
          label="Image path"
          name="image_path"
          defaultValue={banner.image_path}
          hint="Text/path reference only"
        />
        <Field
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={banner.sort_order}
          required
        />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={banner.active}
            className="rounded border-zinc-600"
          />
          Active
        </label>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton>Save</PrimaryButton>
          <GhostLink href="/banners">Back</GhostLink>
          <DangerButton
            onClick={() => {
              deleteBanner(banner.id);
              router.push('/banners');
            }}
          >
            Delete
          </DangerButton>
        </div>
      </form>
    </div>
  );
}
