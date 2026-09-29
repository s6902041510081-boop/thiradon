export default function Header() {
  const today = new Date();
  const dateStr = today.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Life Scheduler</h1>
        <p className="text-sm text-gray-400 mt-1">{dateStr}</p>
      </div>
    </header>
  );
}
