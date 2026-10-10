export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-muted lg:pl-[--rail-width]">
      <div className="page space-y-8">
        <div>
          <div className="skeleton h-4 w-28 mb-2" />
          <div className="skeleton h-9 w-40" />
        </div>
        <div className="skeleton h-52 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
