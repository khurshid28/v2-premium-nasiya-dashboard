import * as XLSX from "xlsx";

type Row = Record<string, any>;

function toSheetWithHeader(title: string, dateLabel: string, rows: Row[]) {
  // Create an empty worksheet
  const ws = XLSX.utils.aoa_to_sheet([[title], ["Date:", dateLabel], []]);

  if (!rows || rows.length === 0) {
    // Write 'No data' cell and return
    XLSX.utils.sheet_add_aoa(ws, [["No data"]], { origin: -1 });
    return ws;
  }

  // Convert rows to worksheet starting at row 4 (zero-based index -> origin: -1 auto appends)
  const headerOrder = Object.keys(rows[0]);
  const data = [headerOrder, ...rows.map((r) => headerOrder.map((h) => (r[h] == null ? "" : r[h])))];

  XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

  // set reasonable column widths based on header lengths
  ws["!cols"] = headerOrder.map((h) => ({ wch: Math.max(10, Math.min(30, h.length + 8)) }));

  return ws;
}

export function exportThreeTables(opts: {
  applications: Row[];
  users: Row[];
  fillials: Row[];
  dateLabel: string;
  filename?: string;
}) {
  const wb = XLSX.utils.book_new();

  const appsSheet = toSheetWithHeader("Applications", opts.dateLabel, opts.applications);
  const usersSheet = toSheetWithHeader("Users", opts.dateLabel, opts.users);
  const fillialsSheet = toSheetWithHeader("Fillials", opts.dateLabel, opts.fillials);

  XLSX.utils.book_append_sheet(wb, appsSheet, "Applications");
  XLSX.utils.book_append_sheet(wb, usersSheet, "Users");
  XLSX.utils.book_append_sheet(wb, fillialsSheet, "Fillials");

  const name = opts.filename ?? `report_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

export function exportSingleTable(opts: { rows: Row[]; title: string; dateLabel: string; filename?: string }) {
  const wb = XLSX.utils.book_new();
  const ws = toSheetWithHeader(opts.title, opts.dateLabel, opts.rows || []);
  XLSX.utils.book_append_sheet(wb, ws, opts.title?.slice(0,31) || "Sheet1");
  const name = opts.filename ?? `${opts.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

export default exportThreeTables;
