'use client';

export function StubBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="mb-4 rounded-lg border border-amber-700/60 bg-amber-950/50 px-4 py-3 text-sm text-amber-100"
    >
      <p className="font-medium">Staging stub — wire when keys land</p>
      <p className="mt-1 text-amber-200/80">{message}</p>
    </div>
  );
}

export function StubToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border border-amber-600 bg-zinc-900 px-4 py-3 shadow-xl"
    >
      <p className="text-sm text-amber-100">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs text-filmy-muted underline hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
}
