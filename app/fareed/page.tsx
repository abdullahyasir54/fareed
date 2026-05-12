import { getSession } from "@/lib/auth";
import { logout, markDone } from "@/app/actions";
import { getRequests } from "@/lib/store";
import { redirect } from "next/navigation";
import NotificationToggle from "./NotificationToggle";

const TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  tea:    { label: "Tea",    emoji: "🍵", color: "bg-amber-100 text-amber-700" },
  coffee: { label: "Coffee", emoji: "☕", color: "bg-orange-100 text-orange-700" },
  food:   { label: "Food",   emoji: "🍽️", color: "bg-green-100 text-green-700" },
  custom: { label: "Custom", emoji: "✏️", color: "bg-purple-100 text-purple-700" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function FareedDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const requests = await getRequests();
  const pending = requests.filter((r) => r.status === "pending");
  const done    = requests.filter((r) => r.status === "done");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Fareed Dashboard</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationToggle />
            <span className="hidden sm:block text-sm text-gray-600">
              Logged in as{" "}
              <span className="font-semibold text-indigo-600">{session.username}</span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, Fareed!</h2>
          <p className="text-gray-500 mt-1 text-sm">You have full admin access.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[
            { label: "Total Employees", value: "1",                  color: "bg-blue-500" },
            { label: "Pending Requests", value: String(pending.length), color: pending.length > 0 ? "bg-rose-500" : "bg-green-500" },
            { label: "Completed Today",  value: String(done.length),    color: "bg-indigo-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
              <div className={`w-2.5 sm:w-3 h-10 sm:h-12 rounded-full flex-shrink-0 ${stat.color}`} />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Incoming Requests</h3>
            {pending.length > 0 && (
              <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-2.5 py-1 rounded-full">
                {pending.length} pending
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => {
                const meta = TYPE_META[req.type];
                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{meta.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                            {meta.label}
                          </span>
                          <span className="text-xs text-gray-400">from {req.username}</span>
                          <span className="text-xs text-gray-400">· {timeAgo(req.created_at)}</span>
                        </div>
                        {req.instructions && (
                          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                            {req.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await markDone(req.id);
                      }}
                      className="sm:flex-shrink-0"
                    >
                      <button
                        type="submit"
                        className="w-full sm:w-auto text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        Mark done ✓
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        {done.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Completed</h3>
            <div className="divide-y divide-gray-100">
              {done.map((req) => {
                const meta = TYPE_META[req.type];
                return (
                  <div key={req.id} className="py-3 flex items-start gap-3 opacity-60">
                    <span className="text-lg flex-shrink-0">{meta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-500">{meta.label}</span>
                        <span className="text-xs text-gray-400">from {req.username}</span>
                        <span className="text-xs text-gray-400">· {timeAgo(req.created_at)}</span>
                      </div>
                      {req.instructions && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {req.instructions}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-green-600 font-medium flex-shrink-0">Done ✓</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
