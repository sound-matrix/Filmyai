'use client';

import { centsToRupeesDisplay, rupeesToCents } from '@filmyai/shared';
import { useState, type FormEvent } from 'react';
import { DangerButton, Field, Flash, PrimaryButton, TextArea } from '../../components/FormFields';
import { useStudio } from '../../components/StudioProvider';

export default function AccessPage() {
  const {
    grants,
    grantAccess,
    revokeAccess,
    pricing,
    pricingSource,
    pricingMessage,
    setMemberPriceCents,
  } = useStudio();
  const [flash, setFlash] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Sync display when pricing loads
  const displayRupees =
    priceInput !== ''
      ? priceInput
      : centsToRupeesDisplay(pricing.member_price_cents);

  function handleGrant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const reason = String(fd.get('reason') || '').trim();
    if (!email || !reason) return;
    grantAccess(email, reason);
    setFlash(`Granted local admin_grant shell to ${email.toLowerCase()}`);
    e.currentTarget.reset();
  }

  async function handleSavePrice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const rupees = priceInput !== '' ? priceInput : centsToRupeesDisplay(pricing.member_price_cents);
    const cents = rupeesToCents(rupees);
    setSavingPrice(true);
    const result = await setMemberPriceCents(cents);
    setSavingPrice(false);
    setPriceInput('');
    setFlash(result.message);
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Access</h1>
      <p className="mb-8 text-studio-muted">
        Member subscription price · admin_grant shell · SOU-14 (checkout SOU-15)
      </p>

      {flash ? <Flash>{flash}</Flash> : null}
      {pricingMessage ? <Flash>{pricingMessage}</Flash> : null}

      <div className="mb-10 max-w-xl rounded-lg border border-zinc-800 bg-studio-panel p-5">
        <h2 className="mb-1 text-lg font-semibold">Member subscription price</h2>
        <p className="mb-4 text-xs text-studio-muted">
          Source: {pricingSource === 'loading' ? '…' : pricingSource}
          {pricingSource === 'supabase' ? ' · pricing_settings' : ' · local until migration 0003'}
          {' · '}
          currency {pricing.member_currency}
        </p>
        <form onSubmit={handleSavePrice} className="space-y-4">
          <div>
            <label htmlFor="member_price_rupees" className="mb-1 block text-sm text-studio-muted">
              Price (₹ rupees)
            </label>
            <input
              id="member_price_rupees"
              name="member_price_rupees"
              type="number"
              min={0}
              step="0.01"
              value={displayRupees}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-studio-panel px-3 py-2.5 text-sm outline-none focus:border-studio-accent min-h-11"
              required
            />
            <p className="mt-1 text-xs text-studio-muted">
              Stored as cents ({pricing.member_price_cents}). Editable anytime — no Razorpay yet
              (SOU-15).
            </p>
          </div>
          <PrimaryButton disabled={savingPrice || pricingSource === 'loading'}>
            {savingPrice ? 'Saving…' : 'Save member price'}
          </PrimaryButton>
        </form>
      </div>

      <div className="mb-10 max-w-xl rounded-lg border border-zinc-800 bg-studio-panel p-5">
        <h2 className="mb-4 text-lg font-semibold">Grant access (admin_grant shell)</h2>
        <form onSubmit={handleGrant} className="space-y-4">
          <Field
            label="Member email / id"
            name="email"
            type="email"
            required
            placeholder="member@example.com"
          />
          <TextArea
            label="Reason"
            name="reason"
            rows={3}
            required
            placeholder="Walkthrough QA admin_grant"
          />
          <PrimaryButton>Grant</PrimaryButton>
        </form>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Local grants</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-studio-panel text-studio-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email / id</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Granted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grants.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td colSpan={6} className="px-4 py-8 text-center text-studio-muted">
                  No grants yet
                </td>
              </tr>
            ) : (
              grants.map((g) => (
                <tr key={g.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 font-medium">{g.email}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-studio-muted">{g.reason}</td>
                  <td className="px-4 py-3 text-studio-muted">admin_grant</td>
                  <td className="px-4 py-3 text-studio-muted">
                    {new Date(g.granted_at).toLocaleString('en-IN', {
                      timeZone: 'Asia/Calcutta',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {g.revoked_at ? (
                      <span className="text-amber-400">Revoked</span>
                    ) : (
                      <span className="text-green-400">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!g.revoked_at ? (
                      <DangerButton
                        onClick={() => {
                          revokeAccess(g.id);
                          setFlash(`Revoked ${g.email}`);
                        }}
                      >
                        Revoke
                      </DangerButton>
                    ) : (
                      <span className="text-xs text-studio-muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
