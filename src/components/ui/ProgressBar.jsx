export default function ProgressBar({ value, max = 100, showLabel = true }) {
  const percent = Math.min(Math.round((value / max) * 100), 100);
  const color = percent === 100 ? "bg-primary" : "bg-dark";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted w-8 text-right">{percent}%</span>
      )}
    </div>
  );
}
