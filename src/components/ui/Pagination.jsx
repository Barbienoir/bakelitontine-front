export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <button
        onClick={() => onChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="text-xs text-muted disabled:opacity-40 px-3 py-1 hover:text-dark"
      >
        Previous page
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-7 h-7 rounded-full text-xs font-semibold transition ${
            p === page ? "bg-primary text-white" : "text-muted hover:text-dark"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(page + 1, pages))}
        disabled={page === pages}
        className="text-xs text-muted disabled:opacity-40 px-3 py-1 hover:text-dark"
      >
        Next page
      </button>
    </div>
  );
}
