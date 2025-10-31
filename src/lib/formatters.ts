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
  // use ru-RU grouping to get space/period style; no UZS suffix
  try {
    const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n);
    return fmt;
  } catch (e) {
    return n.toLocaleString();
  }
}

export function formatMoneyWithUZS(value?: number | string | null) {
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
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return `${n}`;
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
  // Tugatilgan: FINISHED, COMPLETED, ACTIVE
  return s === "FINISHED" || s === "COMPLETED" || s === "ACTIVE";
}

export function isConfirmed(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  // Tasdiqlangan: CONFIRMED
  return s === "CONFIRMED";
}

export function isRejected(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  // Rad qilingan: all CANCELED_ statuses, REJECTED, SCORING
  return s.includes("CANCELED") || s === "SCORING RAD ETDI" || s === "DAILY RAD ETDI" || s === "REJECTED" || s.includes("RAD") || s.includes("SCORING");
}

export function isLimit(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  // Limit: all LIMIT statuses
  return s === "LIMIT" || s.includes("LIMIT");
}

export function isPending(status?: string | null): boolean {
  const s = (status ?? "").toUpperCase();
  // Kutilmoqda: faqat haqiqiy kutish statuslari
  return s === "CREATED" || s === "ADDED_DETAIL" || s.includes("WAITING") || s === "ADDED_PRODUCT" || s === "PENDING";
}

export function appStatusBadge(status?: string | null, fullWidth: boolean = false) {
  const s = (status ?? "").toUpperCase();
  const widthClass = fullWidth ? "w-full" : "";
  const flexClass = fullWidth ? "flex items-center justify-center" : "inline-flex items-center";
  
  // Tasdiqlangan - CONFIRMED status
  if (s === "CONFIRMED") {
    return { label: "TASDIQLANGAN", className: `${flexClass} rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-300 ${widthClass}` };
  }
  
  // Tugatilgan - FINISHED/Completed statuses
  if (s === "FINISHED" || s === "COMPLETED" || s === "ACTIVE") {
    return { label: "TUGATILGAN", className: `${flexClass} rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300 ${widthClass}` };
  }
  
  // Rad qilingan - Rejected/Cancelled statuses
  if (s.includes("CANCELED") || s === "SCORING RAD ETDI" || s === "DAILY RAD ETDI" || s.includes("RAD") || s === "REJECTED" || s.includes("SCORING")) {
    return { label: "RAD QILINGAN", className: `${flexClass} rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-800 dark:text-red-300 ${widthClass}` };
  }
  
  // Limit - Limit statuses
  if (s === "LIMIT" || s.includes("LIMIT")) {
    return { label: "LIMIT", className: `${flexClass} rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300 ${widthClass}` };
  }
  
  // Kutilmoqda - All other statuses (pending, waiting, etc)
  return { label: "KUTILMOQDA", className: `${flexClass} rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-300 ${widthClass}` };
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

// 24-hour date formatter with Uzbek relative labels for today/yesterday
// Rules:
// - Today: "bugun HH:mm"
// - Yesterday: "kecha HH:mm"
// - Other: "Oct 19, 2025, 21:21"
export function formatDate24Hour(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const now = new Date();

    // Get today's date at midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get yesterday's date at midnight
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get the input date at midnight
    const inputDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (inputDate.getTime() === today.getTime()) {
      // Today: show time
      return `Bugun ${timeStr}`;
    } else if (inputDate.getTime() === yesterday.getTime()) {
      // Yesterday: show label with time
      return `Kecha ${timeStr}`;
    } else {
      // For other dates, use original format
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      const year = d.getFullYear();
      return `${month} ${day}, ${year}, ${timeStr}`;
    }
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

// (Note) Only one export for formatDate24Hour must exist. Older duplicate removed above.
