'use client';

import { useState, type FormEvent } from 'react';
import { DangerButton, Field, Flash, PrimaryButton, TextArea } from '../../components/FormFields';
import { useStudio } from '../../components/StudioProvider';

export default function AccessPage() {
  const { grants, grantAccess, revokeAccess } = useStudio();
  const [flash, setFlash] = useState<string | null>(null);

  function handleGrant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const reason = String(fd.get('reason') || '').trim();
    if (!email || !reason) return;
    grantAccess(email, reason);
    setFlash(`Granted local access to ${email.toLowerCase()}`);
    e.currentTarget.reset();
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Access</h1>
      <p className="mb-8 text-studio-muted">
        Grant / revoke shell · id/email + reason · local grants table only
      </p>

      {flash ? <Flash>{flash}</Flash> : null}

      <div className="mb-10 max-w-xl rounded-lg border border-zinc-800 bg-studio-panel p-5">
        <h2 className="mb-4 text-lg font-semibold">Grant access</h2>
        <form onSubmit={handleGrant} className="space-y-4">
          <Field
            label="Member email / id"
            name="email"
            type="email"
            required
            placeholder="member@example.com"
          />
          <TextArea label="Reason" name="reason" rows={3} required placeholder="Walkthrough QA access" />
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
              <th className="px-4 py-3 font-medium">Granted</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grants.length === 0 ? (
              <tr className="border-t border-zinc-800">
                <td colSpan={5} className="px-4 py-8 text-center text-studio-muted">
                  No grants yet
                </td>
              </tr>
            ) : (
              grants.map((g) => (
                <tr key={g.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3 font-medium">{g.email}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-studio-muted">{g.reason}</td>
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
