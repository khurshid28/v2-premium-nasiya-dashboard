import React from "react";
import DetailModal from "components/modal/DetailModalNew";
import EditModal from "components/modal/EditModal";
import api from "lib/api";
import { exportSingleTable } from "lib/exportExcel";
import { formatPhone } from "lib/formatters";
import Pagination from "components/pagination";
import Toast from "components/toast/Toast";
import CustomSelect from "components/dropdown/CustomSelect";

// Assumed Prisma model fields for Fillial/Branch. If your schema uses different names,
// tell me and I'll update these mappings to match.
// Mapped to your Prisma `Fillial` model. Adjust names if your schema differs.
type Fillial = {
  id: number;
  name: string;
  image?: string | null;
  address?: string | null;
  region?: string | null; // REGION enum in Prisma
  work_status?: string | null; // WORK_STATUS enum
  merchant?: { id: number; name: string } | null;
  nds?: string | null;
  hisob_raqam?: string | null;
  bank_name?: string | null;
  mfo?: string | null;
  inn?: string | null;
  director_name?: string | null;
  director_phone?: string | null;
  percent_type?: string | null; // PERCENT_TYPE enum
  expired_months?: any; // Json
  cashback_percent?: number;
  cashback_amount?: number;
  max_amount?: number;
  timeout?: number;
  createdAt?: string;
  updatedAt?: string | null;
};

const initialData: Fillial[] = [
  {
    id: 1,
    name: "Main Branch",
    image: null,
    address: "123 Central St.",
    region: "TASHKENT",
    work_status: "WORKING",
  merchant: { id: 10, name: "ACME Retail" },
    nds: "15%",
    hisob_raqam: "1234567890",
    bank_name: "Asaka Bank",
    mfo: "012345",
    inn: "998877665",
    director_name: "Jamshid Usmanov",
    director_phone: "+998901112233",
    percent_type: "OUT",
    expired_months: ["2025-10", "2025-11"],
    cashback_percent: 2.5,
    cashback_amount: 10000,
    max_amount: 50000000,
    timeout: 600,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 2,
    name: "East Branch",
    image: null,
    address: "45 East Ave",
    region: "SAMARKAND",
    work_status: "WORKING",
  merchant: { id: 10, name: "ACME Retail" },
    nds: "15%",
    hisob_raqam: "2233445566",
    bank_name: "Ipak Yuli",
    mfo: "065432",
    inn: "112233445",
    director_name: "Dilshod Bek",
    director_phone: "+998901112234",
    percent_type: "OUT",
    expired_months: ["2025-12"],
    cashback_percent: 1.0,
    cashback_amount: 5000,
    max_amount: 30000000,
    timeout: 600,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 3,
    name: "West Branch",
    image: null,
    address: "7 West Road",
    region: "BUKHARA",
    work_status: "CLOSED",
  merchant: { id: 10, name: "ACME Retail" },
    nds: "15%",
    hisob_raqam: "3344556677",
    bank_name: "Xalq Bank",
    mfo: "078901",
    inn: "556677889",
    director_name: "Nodir Karimov",
    director_phone: "+998901112235",
    percent_type: "IN",
    expired_months: [],
    cashback_percent: 0,
    cashback_amount: 0,
    max_amount: 5000000,
    timeout: 300,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

const Fillials = (): JSX.Element => {
  const [data, setData] = React.useState<Fillial[]>(initialData);
  const [search, setSearch] = React.useState("");
  const [regionFilter, setRegionFilter] = React.useState("all");
  
  // Client-side pagination
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  
  const [selected, setSelected] = React.useState<Fillial | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editInitial, setEditInitial] = React.useState<any>(null);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState<"main" | "success" | "error">("main");

  const regions = React.useMemo(() => {
    const set = new Set<string>();
    const fillials = Array.isArray(data) ? data : [];
    fillials.forEach((d) => { if (d.region) set.add(d.region); });
    return Array.from(set).sort();
  }, [data]);

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    const fillials = Array.isArray(data) ? data : [];
    return fillials.filter((d) => {
      const matchesSearch =
        !s || d.name.toLowerCase().includes(s) || (d.region ?? "").toLowerCase().includes(s);
      const matchesRegion = regionFilter === "all" || d.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [data, search, regionFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, regionFilter]);

  React.useEffect(() => {
    let mounted = true;
    console.log('Fetching fillials from API...');
    api.listFillials({})
      .then((res) => {
        if (!mounted) return;
        console.log('Fillials response:', res);
        setData(res?.items || []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error fetching fillials:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.status,
          body: err.body
        });
        setData([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Paginate filtered data
  const pageData = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Filiallar</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 pl-10 w-80 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm hover:shadow-md hover:border-brand-500 dark:hover:border-brand-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Nom yoki hudud bo'yicha qidirish"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={() => { setEditInitial(null); setEditOpen(true); }} className="h-11 rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 px-4 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200">Filial qo'shish</button>
          <CustomSelect
            value={regionFilter}
            onChange={setRegionFilter}
            options={[
              { value: "all", label: "Barcha hududlar" },
              ...regions.map(c => ({ value: c, label: c }))
            ]}
            className="min-w-[140px]"
          />
          
          <CustomSelect
            value={String(pageSize)}
            onChange={(value) => setPageSize(Number(value))}
            options={[
              { value: "5", label: "5 ta" },
              { value: "10", label: "10 ta" },
              { value: "25", label: "25 ta" },
              { value: "50", label: "50 ta" }
            ]}
            className="min-w-[120px]"
          />
          
          <button
            onClick={async () => {
              const res = await api.listFillials({});
              const rows = (res.items ?? []).map((f: any) => ({
                ID: f.id,
                Name: f.name,
                Address: f.address ?? "",
                Merchant: f.merchant?.name ?? "",
                Region: f.region ?? "",
                Status: f.work_status ?? "",
                Created: f.createdAt ?? "",
              }));
              exportSingleTable({ rows, title: "Filiallar", dateLabel: "Barcha sanalar" });
            }}
            className="h-10 rounded bg-indigo-600 hover:bg-indigo-700 px-3 text-white"
          >
            Filiallarni export qilish
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
        <table className="w-full table-auto min-w-[600px]">
          <thead className="bg-gray-50 dark:bg-navy-800 text-left text-sm text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nomi</th>
              <th className="px-6 py-4">Hudud</th>
              <th className="px-6 py-4">Direktor</th>
              <th className="px-6 py-4">Holat</th>
              <th className="px-6 py-4">Yaratildi</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-navy-800">
            {pageData.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
              >
                <td className="px-6 py-3">{row.id}</td>
                <td className="px-6 py-3">{row.name}</td>
                <td className="px-6 py-3">{row.region ?? "-"}</td>
                <td className="px-6 py-3">{row.director_name ?? "-"}</td>
                <td className="px-4 py-2">
                  {row.work_status === "WORKING" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-800 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-100">Ishlaydi</span>
                  ) : row.work_status === "BLOCKED" ? (
                    <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-800 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-100">Bloklangan</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-100">{row.work_status ?? "-"}</span>
                  )}
                </td>
                <td className="px-4 py-2">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
            <DetailModal
              title={selected ? `Filial: ${selected.name}` : "Filial tafsilotlari"}
              isOpen={open}
              onClose={() => {
                setOpen(false);
                setSelected(null);
              }}
            >
      {selected ? (
        <div className="space-y-2">
                    <div className="flex items-start gap-4">
                      {selected.image ? (
                        <img src={selected.image} alt={selected.name} className="h-20 w-20 rounded object-cover" />
                      ) : null}
                      <div>
                        <div><strong className="text-gray-700 dark:text-gray-300">Hudud:</strong> <span className="text-gray-900 dark:text-white">{selected.region ?? "-"}</span></div>
                      </div>
                    </div>
                    <div><strong className="text-gray-700 dark:text-gray-300">Direktor:</strong> <span className="text-gray-900 dark:text-white">{selected.director_name ?? "-"} ({formatPhone(selected.director_phone)})</span></div>
                    <div><strong className="text-gray-700 dark:text-gray-300">Bank:</strong> <span className="text-gray-900 dark:text-white">{selected.bank_name ?? "-"} {selected.mfo ? `MFO:${selected.mfo}` : ""}</span></div>
                    <div><strong className="text-gray-700 dark:text-gray-300">Hisob raqam:</strong> <span className="text-gray-900 dark:text-white">{selected.hisob_raqam ?? "-"}</span></div>
                    <div><strong className="text-gray-700 dark:text-gray-300">NDS:</strong> <span className="text-gray-900 dark:text-white">{selected.nds ?? "-"}</span></div>
                    <div className="mt-4 flex gap-2">
                      <button
                        className="rounded bg-gray-200 dark:bg-gray-600 px-3 py-1 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
                        onClick={() => {
                          const payload = `Nomi: ${selected.name}\nManzil: ${selected.address ?? "-"}\nHudud: ${selected.region ?? "-"}\nNDS: ${selected.nds ?? "-"}\nHisob raqam: ${selected.hisob_raqam ?? "-"}\nBank: ${selected.bank_name ?? "-"} ${selected.mfo ? `MFO:${selected.mfo}` : ""}\nINN: ${selected.inn ?? "-"}\nDirektor: ${selected.director_name ?? "-"} (${selected.director_phone ?? "-"})`;
                          navigator.clipboard.writeText(payload).then(() => {
                            setToastType("main");
                            setToastMessage("Ma'lumotlar clipboard'ga ko'chirildi");
                            setToastOpen(true);
                          }).catch(() => {
                            setToastType("error");
                            setToastMessage("Ko'chirishda xatolik");
                            setToastOpen(true);
                          });
                        }}
                      >
                        Barcha ma'lumotlarni ko'chirish
                      </button>
                      <button className="rounded bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white" onClick={() => { setEditInitial(selected); setEditOpen(true); }}>Tahrirlash</button>
                    </div>
                  </div>
              ) : null}
            </DetailModal>
            <EditModal
              isOpen={editOpen}
              onClose={() => { setEditOpen(false); setEditInitial(null); }}
              initial={editInitial}
              type="fillial"
              onSave={async (payload) => {
                if (editInitial && editInitial.id) {
                  await api.updateFillial(editInitial.id, payload);
                } else {
                  await api.createFillial(payload);
                }
                const res = await api.listFillials({});
                setData(res.items || []);
              }}
            />
            <Toast message={toastMessage} isOpen={toastOpen} onClose={() => setToastOpen(false)} type={toastType} />
            {pageData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Natijalar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">{`${total} dan ${pageData.length} ta ko'rsatilmoqda`}</div>
        <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default Fillials;
