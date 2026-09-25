'use client';

import type { AccessRule } from '@filmyai/shared';
import { useRouter } from 'next/navigation';
import { type FormEvent } from 'react';
import {
  Field,
  GhostLink,
  PrimaryButton,
  SelectField,
  TextArea,
} from '../../../components/FormFields';
import { useStudio } from '../../../components/StudioProvider';

export default function NewFilmPage() {
  const { createFilm } = useStudio();
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createFilm({
      title: String(fd.get('title') || ''),
      slug: String(fd.get('slug') || ''),
      synopsis: String(fd.get('synopsis') || ''),
      genre: String(fd.get('genre') || ''),
      poster_path: String(fd.get('poster_path') || ''),
      backdrop_path: String(fd.get('backdrop_path') || ''),
      access_rule: String(fd.get('access_rule') || 'public') as AccessRule,
      launch_at: String(fd.get('launch_at') || '')
        ? new Date(String(fd.get('launch_at'))).toISOString()
        : '',
      published: fd.get('published') === 'on',
      playback_package_key: String(fd.get('playback_package_key') || ''),
    });
    router.push('/films');
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">New film</h1>
      <p className="mb-8 text-studio-muted">
        Film type fields · path/text refs only · local state · no binary upload
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title" name="title" required />
        <Field
          label="Slug"
          name="slug"
          placeholder="auto from title if empty"
          hint="Use generic placeholders only — not Last Voicemail / Still Typing"
        />
        <TextArea label="Synopsis" name="synopsis" rows={4} required />
        <Field label="Genre" name="genre" required />
        <Field
          label="Poster path"
          name="poster_path"
          placeholder="/placeholders/poster.jpg"
          hint="Text/path reference — no Drive upload"
        />
        <Field
          label="Backdrop path"
          name="backdrop_path"
          placeholder="/placeholders/backdrop.jpg"
        />
        <Field
          label="Playback package key"
          name="playback_package_key"
          placeholder="packages/placeholder/v1"
          hint="Package ref string only"
        />
        <SelectField label="Access rule" name="access_rule" defaultValue={'public' satisfies AccessRule}>
          <option value="public">public</option>
          <option value="members">members</option>
          <option value="paid">paid</option>
        </SelectField>
        <Field label="Launch date" name="launch_at" type="date" />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="published" className="rounded border-zinc-600" />
          Publish (local toggle shell)
        </label>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton>Create film</PrimaryButton>
          <GhostLink href="/films">Cancel</GhostLink>
        </div>
      </form>
    </div>
  );
}
