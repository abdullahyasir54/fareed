import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions";
import { redirect } from "next/navigation";
import { getUserPendingRequests } from "@/lib/store";
import RequestPanel from "./RequestPanel";

const TYPE_META: Record<string, { label: string; emoji: string }> = {
  tea:    { label: "Tea",    emoji: "🍵" },
  coffee: { label: "Coffee", emoji: "☕" },
  food:   { label: "Food",   emoji: "🍽️" },
  custom: { label: "Custom", emoji: "✏️" },
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

export default async function EmployeeDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = session.username.charAt(0).toUpperCase() + session.username.slice(1);
  const pendingRequests = await getUserPendingRequests(session.username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="text-xs text-gray-500">My Workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              Logged in as <span className="font-semibold text-emerald-600">{session.username}</span>
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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {name}!</h2>
          <p className="text-gray-500 mt-1 text-sm">What would you like to request today?</p>
        </div>

        <RequestPanel />

        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-semibold text-gray-900">Your Pending Requests</h3>
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            </div>
            <div className="space-y-2">
              {pendingRequests.map((req) => {
                const meta = TYPE_META[req.type];
                return (
                  <div
                    key={req.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                  >
                    <span className="text-xl flex-shrink-0">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">{meta.label}</span>
                        <span className="text-xs text-gray-400">· {timeAgo(req.created_at)}</span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      </div>
                      {req.instructions && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{req.instructions}</p>
                      )}
                    </div>
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
