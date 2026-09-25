'use client';

import type { AccessRule } from '@filmyai/shared';
import { centsToRupeesDisplay, normalizeAccessRule, rupeesToCents } from '@filmyai/shared';
import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  DangerButton,
  Field,
  Flash,
  GhostLink,
  PrimaryButton,
  SelectField,
  TextArea,
} from '../../../components/FormFields';
import { useStudio } from '../../../components/StudioProvider';

export default function EditFilmPage() {
  const { id } = useParams<{ id: string }>();
  const { films, updateFilm, deleteFilm, toggleFilmPublished } = useStudio();
  const film = films.find((f) => f.id === id);
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accessRule, setAccessRule] = useState<AccessRule | null>(null);

  if (!film) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold">Film not found</h1>
        <p className="mb-6 text-studio-muted">It may have been deleted from local state.</p>
        <GhostLink href="/films">Back to films</GhostLink>
      </div>
    );
  }

  const rule = accessRule ?? normalizeAccessRule(film.access_rule);
  const launchDate = film.launch_at ? film.launch_at.slice(0, 10) : '';
  const defaultSpecialRupees =
    film.special_pay_price_cents != null
      ? centsToRupeesDisplay(film.special_pay_price_cents)
      : '';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextRule = normalizeAccessRule(String(fd.get('access_rule') || 'free'));
    const rupees = String(fd.get('special_pay_price_rupees') || '');
    const special_pay_price_cents =
      nextRule === 'special_pay' ? rupeesToCents(rupees) : null;
    if (nextRule === 'special_pay' && (!special_pay_price_cents || special_pay_price_cents <= 0)) {
      return;
    }
    setSaving(true);
    await updateFilm(film!.id, {
      title: String(fd.get('title') || ''),
      slug: String(fd.get('slug') || ''),
      synopsis: String(fd.get('synopsis') || ''),
      genre: String(fd.get('genre') || ''),
      poster_path: String(fd.get('poster_path') || ''),
      backdrop_path: String(fd.get('backdrop_path') || ''),
      access_rule: nextRule,
      special_pay_price_cents,
      launch_at: String(fd.get('launch_at') || '')
        ? new Date(String(fd.get('launch_at'))).toISOString()
        : film!.launch_at,
      published: fd.get('published') === 'on',
      playback_package_key: String(fd.get('playback_package_key') || ''),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Edit film</h1>
      <p className="mb-8 text-studio-muted">Local shell · id {film.id} · film_access upsert when configured</p>
      {saved ? (
        <Flash>Updated in local studio state (and film_access when Supabase + admin session OK).</Flash>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title" name="title" required defaultValue={film.title} />
        <Field label="Slug" name="slug" required defaultValue={film.slug} />
        <TextArea label="Synopsis" name="synopsis" rows={4} required defaultValue={film.synopsis} />
        <Field label="Genre" name="genre" required defaultValue={film.genre} />
        <Field label="Poster path" name="poster_path" defaultValue={film.poster_path} />
        <Field label="Backdrop path" name="backdrop_path" defaultValue={film.backdrop_path} />
        <Field
          label="Playback package key"
          name="playback_package_key"
          defaultValue={film.playback_package_key}
        />
        <SelectField
          label="Access rule"
          name="access_rule"
          value={rule}
          onChange={(e) => setAccessRule(normalizeAccessRule(e.target.value))}
        >
          <option value="free">Free</option>
          <option value="members">Members</option>
          <option value="special_pay">Special pay</option>
        </SelectField>
        {rule === 'special_pay' ? (
          <Field
            label="Special pay price (₹)"
            name="special_pay_price_rupees"
            type="number"
            min={0.01}
            step="0.01"
            required
            defaultValue={defaultSpecialRupees}
            hint="One-time fee · stored as cents · checkout SOU-15"
          />
        ) : null}
        <Field label="Launch date" name="launch_at" type="date" defaultValue={launchDate} />
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={film.published}
            className="rounded border-zinc-600"
          />
          Published
        </label>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton disabled={saving}>{saving ? 'Saving…' : 'Save'}</PrimaryButton>
          <button
            type="button"
            onClick={() => toggleFilmPublished(film.id)}
            className="inline-flex min-h-11 items-center rounded-md border border-zinc-700 px-4 py-2 text-sm hover:border-studio-accent"
          >
            Toggle publish
          </button>
          <GhostLink href="/films">Back</GhostLink>
          <DangerButton
            onClick={() => {
              deleteFilm(film.id);
              router.push('/films');
            }}
          >
            Delete
          </DangerButton>
        </div>
      </form>
    </div>
  );
}
