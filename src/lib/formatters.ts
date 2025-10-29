export function formatPhone(input?: string | null) {
  const s = String(input ?? "").replace(/\D/g, "");
  if (!s) return "-";
  // take the last 9 digits as local part
  const tail = s.slice(-9);
  const a = tail.slice(0, 2);
  const b = tail.slice(2, 5);
  const c = tail.slice(5, 7);
  const d = tail.slice(7, 9);
  const formatted = `(${a}) ${b}-${c}-${d}`;
  // if the input contained the country code 998 at the front, show +998
  const has998 = s.length > 9 && s.slice(0, s.length - 9).includes("998");
  return has998 ? `+998 ${formatted}` : formatted;
}

export function formatMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(n)) return "-";
  // use ru-RU grouping to get space/period style; append UZS
  try {
    const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
    return `${fmt} UZS`;
  } catch (e) {
    return `${n.toLocaleString()} UZS`;
  }
}

export function formatShortMoney(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "-";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B UZS`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M UZS`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K UZS`;
  return `${n} UZS`;
}

export function statusBadge(status?: string | null) {
  const s = status ?? "";
  if (s === "WORKING") return { label: "ISHLAYDI", className: "inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300" };
  if (s === "BLOCKED") return { label: "BLOKLANGAN", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  return { label: s || "-", className: "inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-300" };
}

// Helper functions to check application status category
export function isApproved(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  return s === "CONFIRMED" || s === "FINISHED";
}

export function isRejected(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  return s === "CANCELED_BY_SCORING" || s === "CANCELED_BY_CLIENT" || s === "CANCELED_BY_DAILY";
}

export function isLimit(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  return s === "LIMIT";
}

export function isPending(status?: string | null): boolean {
  return !isApproved(status) && !isRejected(status) && !isLimit(status);
}

export function appStatusBadge(status?: string | null) {
  const s = (status ?? "").toUpperCase();
  
  // Approved statuses
  if (s === "CONFIRMED") return { label: "TASDIQLANDI", className: "inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300" };
  if (s === "FINISHED") return { label: "YAKUNLANDI", className: "inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300" };
  
  // Rejected statuses
  if (s === "CANCELED_BY_SCORING") return { label: "SCORING RAD ETDI", className: "inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300" };
  if (s === "CANCELED_BY_CLIENT") return { label: "MIJOZ RAD ETDI", className: "inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300" };
  if (s === "CANCELED_BY_DAILY") return { label: "DAILY RAD ETDI", className: "inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300" };
  
  // Limit status
  if (s === "LIMIT") return { label: "LIMIT BERILDI", className: "inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-800 dark:text-purple-300" };
  
  // Pending statuses
  if (s === "CREATED") return { label: "YARATILDI", className: "inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-300" };
  if (s === "ADDED_DETAIL") return { label: "MA'LUMOT QO'SHILDI", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  if (s === "WAITING_SCORING") return { label: "SCORING KUTILMOQDA", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  if (s === "ADDED_PRODUCT") return { label: "MAHSULOT QO'SHILDI", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  if (s === "WAITING_BANK_UPDATE") return { label: "BANK YANGILANISHI KUTILMOQDA", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  if (s === "WAITING_BANK_CONFIRM") return { label: "BANK TASDIG'I KUTILMOQDA", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  
  // Old statuses for backward compatibility
  if (s === "APPROVED") return { label: "TASDIQLANDI", className: "inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300" };
  if (s === "REJECTED") return { label: "RAD ETILDI", className: "inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300" };
  if (s === "PENDING") return { label: "KUTILMOQDA", className: "inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300" };
  
  return { label: status ?? "-", className: "inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-300" };
}

export function formatDateNoSeconds(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    // format without seconds
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return iso;
  }
}

export function formatDate24Hour(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    // Custom format to ensure 24-hour time like "Oct 19, 2025, 21:21"
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
  } catch (e) {
    return iso;
  }
}

export function formatDateShort(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  } catch (e) {
    return iso;
  }
}
