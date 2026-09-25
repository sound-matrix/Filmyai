'use client';

import type { CollectionVisibility } from '@filmyai/shared';
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

function parseSlugs(raw: string) {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function NewCollectionPage() {
  const { createCollection } = useStudio();
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createCollection({
      name: String(fd.get('name') || ''),
      visibility: String(fd.get('visibility') || 'public') as CollectionVisibility,
      film_slugs: parseSlugs(String(fd.get('film_slugs') || '')),
    });
    router.push('/collections');
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">New collection</h1>
      <p className="mb-8 text-studio-muted">Ordered film slug placeholders · local state</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Name" name="name" required />
        <SelectField
          label="Visibility"
          name="visibility"
          defaultValue={'public' satisfies CollectionVisibility}
        >
          <option value="public">public</option>
          <option value="members">members</option>
          <option value="hidden">hidden</option>
        </SelectField>
        <TextArea
          label="Film slugs (ordered)"
          name="film_slugs"
          rows={4}
          placeholder={'placeholder\ncoming-soon'}
          hint="One slug per line or comma-separated · reorder later on edit"
        />
        <div className="flex flex-wrap gap-3">
          <PrimaryButton>Create collection</PrimaryButton>
          <GhostLink href="/collections">Cancel</GhostLink>
        </div>
      </form>
    </div>
  );
}
