export default function HomePage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Home</h1>
      <p className="mb-8 text-filmy-muted">
        Empty · awaiting FilmyAI uploads · SOU-11 scaffold
      </p>
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-filmy-muted">Genre</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="block w-40 shrink-0 overflow-hidden rounded-lg bg-filmy-card"
            >
              <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 px-2 text-center text-xs text-filmy-muted">
                Empty · awaiting FilmyAI uploads
              </div>
              <div className="p-2">
                <p className="truncate text-sm text-filmy-muted">—</p>
                <p className="text-xs text-filmy-muted">—</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
