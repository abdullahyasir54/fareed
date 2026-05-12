"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendRequest } from "@/app/actions";

const initialState = { success: false, error: "" };

type QuickType = "tea" | "coffee" | "food" | "custom";

const QUICK_TYPES: { type: QuickType; label: string; emoji: string; hasText: boolean; placeholder?: string }[] = [
  { type: "tea", label: "Tea", emoji: "🍵", hasText: false },
  { type: "coffee", label: "Coffee", emoji: "☕", hasText: false },
  { type: "food", label: "Food", emoji: "🍽️", hasText: true, placeholder: "What would you like to eat? e.g. biryani, burger..." },
  { type: "custom", label: "Custom Request", emoji: "✏️", hasText: true, placeholder: "Type your request here..." },
];

export default function RequestPanel() {
  const [state, formAction, pending] = useActionState(sendRequest, initialState);
  const [activeType, setActiveType] = useState<QuickType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setToast(`${activeType === "tea" ? "Tea" : activeType === "coffee" ? "Coffee" : activeType === "food" ? "Food order" : "Request"} sent to Fareed!`);
      setActiveType(null);
      formRef.current?.reset();
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [state.success, state]);

  function handleQuickSend(type: QuickType) {
    if (type === "tea" || type === "coffee") {
      const fd = new FormData();
      fd.append("type", type);
      formAction(fd);
      setActiveType(type);
    } else {
      setActiveType((prev) => (prev === type ? null : type));
    }
  }

  const active = QUICK_TYPES.find((q) => q.type === activeType && q.hasText);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Quick Requests</h3>
      <p className="text-xs text-gray-500 mb-5">Send a request to Fareed instantly</p>

      {/* Quick buttons grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_TYPES.map(({ type, label, emoji }) => (
          <button
            key={type}
            type="button"
            onClick={() => handleQuickSend(type)}
            disabled={pending && activeType === type && !active}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium
              ${activeType === type
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              }
              ${pending && activeType === type && !active ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            <span className="text-2xl">{emoji}</span>
            <span>{label}</span>
            {pending && activeType === type && !active && (
              <span className="text-xs text-emerald-500">Sending...</span>
            )}
          </button>
        ))}
      </div>

      {/* Expandable form for food / custom */}
      {active && (
        <form
          ref={formRef}
          action={formAction}
          className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3"
        >
          <input type="hidden" name="type" value={active.type} />
          <label className="block text-sm font-medium text-gray-700">
            {active.type === "food" ? "Food instructions" : "Your request"}
          </label>
          <textarea
            name="instructions"
            rows={3}
            required
            placeholder={active.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {state.error && (
            <p className="text-xs text-red-600">{state.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {pending ? "Sending..." : `Send ${active.emoji}`}
            </button>
            <button
              type="button"
              onClick={() => setActiveType(null)}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Toast */}
      {toast && (
        <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
          <span>✓</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
