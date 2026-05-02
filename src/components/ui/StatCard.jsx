export default function StatCard({ title, value, subtitle, icon, highlight }) {
  return (
    <div className={`rounded-xl p-4 md:p-5 shadow-sm ${highlight ? "bg-primary text-white" : "bg-white"}`}>
      <p className={`text-xs md:text-sm font-medium ${highlight ? "text-white/80" : "text-muted"}`}>
        {title}
      </p>
      <p className={`text-xl md:text-2xl font-bold mt-1 ${highlight ? "text-white" : "text-dark"}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-xs mt-1 ${highlight ? "text-white/70" : "text-muted"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
