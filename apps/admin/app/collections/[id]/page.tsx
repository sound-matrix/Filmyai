'use client';

import type { CollectionVisibility } from '@filmyai/shared';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  DangerButton,
  Field,
  Flash,
  GhostLink,
  PrimaryButton,
  SelectField,
} from '../../../components/FormFields';
import { useStudio } from '../../../components/StudioProvider';

export default function EditCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const { collections, updateCollection, reorderCollectionSlugs, deleteCollection } = useStudio();
  const collection = collections.find((c) => c.id === id);
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [newSlug, setNewSlug] = useState('');

  useEffect(() => {
    if (collection) setSlugs(collection.film_slugs);
  }, [collection]);

  if (!collection) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold">Collection not found</h1>
        <p className="mb-6 text-studio-muted">It may have been deleted from local state.</p>
        <GhostLink href="/collections">Back to collections</GhostLink>
      </div>
    );
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= slugs.length) return;
    const copy = [...slugs];
    const tmp = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = tmp;
    setSlugs(copy);
    reorderCollectionSlugs(collection!.id, copy);
  }

  function removeSlug(index: number) {
    const copy = slugs.filter((_, i) => i !== index);
    setSlugs(copy);
    reorderCollectionSlugs(collection!.id, copy);
  }

  function addSlug() {
    const s = newSlug.trim();
    if (!s) return;
    const copy = [...slugs, s];
    setSlugs(copy);
    setNewSlug('');
    reorderCollectionSlugs(collection!.id, copy);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateCollection(collection!.id, {
      name: String(fd.get('name') || ''),
      visibility: String(fd.get('visibility') || 'public') as CollectionVisibility,
      film_slugs: slugs,
    });
    setSaved(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Edit collection</h1>
      <p className="mb-8 text-studio-muted">Reorder slugs in local state · id {collection.id}</p>
      {saved ? <Flash>Updated in local studio state (no Supabase write).</Flash> : null}

      <form onSubmit={handleSubmit} className="mb-8 space-y-5">
        <Field label="Name" name="name" required defaultValue={collection.name} />
        <SelectField label="Visibility" name="visibility" defaultValue={collection.visibility}>
          <option value="public">public</option>
          <option value="members">members</option>
          <option value="hidden">hidden</option>
        </SelectField>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton>Save</PrimaryButton>
          <GhostLink href="/collections">Back</GhostLink>
          <DangerButton
            onClick={() => {
              deleteCollection(collection.id);
              router.push('/collections');
            }}
          >
            Delete
          </DangerButton>
        </div>
      </form>

      <h2 className="mb-3 text-lg font-semibold">Ordered film slugs</h2>
      <ul className="mb-4 space-y-2">
        {slugs.length === 0 ? (
          <li className="rounded border border-zinc-800 px-4 py-3 text-sm text-studio-muted">
            No slugs yet
          </li>
        ) : (
          slugs.map((slug, index) => (
            <li
              key={`${slug}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded border border-zinc-800 bg-studio-panel px-3 py-2"
            >
              <span className="mr-auto font-mono text-sm">{slug}</span>
              <button
                type="button"
                className="min-h-11 rounded border border-zinc-700 px-3 text-xs"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                Up
              </button>
              <button
                type="button"
                className="min-h-11 rounded border border-zinc-700 px-3 text-xs"
                onClick={() => move(index, 1)}
                disabled={index === slugs.length - 1}
              >
                Down
              </button>
              <DangerButton onClick={() => removeSlug(index)}>Remove</DangerButton>
            </li>
          ))
        )}
      </ul>
      <div className="flex flex-wrap gap-2">
        <input
          value={newSlug}
          onChange={(e) => setNewSlug(e.target.value)}
          placeholder="slug-placeholder"
          className="min-h-11 flex-1 rounded-md border border-zinc-700 bg-studio-panel px-3 py-2 text-sm outline-none focus:border-studio-accent"
        />
        <button
          type="button"
          onClick={addSlug}
          className="inline-flex min-h-11 items-center rounded-md bg-studio-accent px-4 text-sm font-semibold text-white hover:bg-blue-600"
        >
          Add slug
        </button>
      </div>
    </div>
  );
}
