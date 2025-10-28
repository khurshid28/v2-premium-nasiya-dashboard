import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useUser } from "contexts/UserContext";

import { FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import {
  IoMdInformationCircleOutline,
} from "react-icons/io";
import avatar from "assets/img/avatars/avatar4.png";
import api from "lib/mockApi";
import DetailModal from "components/modal/DetailModalNew";

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
}) => {
  const { onOpenSidenav, brandText } = props;
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };
  const [darkmode, setDarkmode] = React.useState(false);

  // Global search state
  type SearchItem = {
    type: "operator" | "application" | "fillial";
    id: number;
    title: string;
    subtitle?: string;
    raw: any;
  };
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [showResults, setShowResults] = React.useState(false);
  const [selected, setSelected] = React.useState<SearchItem | null>(null);
  const searchBoxRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    setShowResults(true);
    const t = setTimeout(async () => {
      try {
        const [usersRes, appsRes, filsRes] = await Promise.all([
          api.listUsers({ page: 1, pageSize: 5, search: query }),
          api.listApplications({ page: 1, pageSize: 5, search: query }),
          api.listFillials({ page: 1, pageSize: 5, search: query }),
        ]);
        const list: SearchItem[] = [];
        usersRes.items.forEach((u: any) =>
          list.push({
            type: "operator",
            id: u.id,
            title: u.fullname ?? "",
            subtitle: u.phone ?? "",
            raw: u,
          })
        );
        appsRes.items.forEach((a: any) =>
          list.push({
            type: "application",
            id: a.id,
            title: `${a.fullname ?? "-"} • #${a.id}`,
            subtitle: `${a.phone ?? ""} ${a.status ? " • " + a.status : ""}`.trim(),
            raw: a,
          })
        );
        filsRes.items.forEach((f: any) =>
          list.push({
            type: "fillial",
            id: f.id,
            title: f.name ?? "",
            subtitle: f.region ? `Hudud: ${f.region}` : undefined,
            raw: f,
          })
        );
        setResults(list);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!searchBoxRef.current) return;
      if (!searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <span className="text-sm font-normal text-navy-700 dark:text-white">Sahifalar</span>
          <span className="mx-1 text-sm text-navy-700 dark:text-white">/</span>
          <span className="text-sm font-normal capitalize text-navy-700 dark:text-white">{brandText}</span>
        </div>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div ref={searchBoxRef} className="relative flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowResults(true)}
            className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
          {showResults && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-white/10 dark:bg-navy-700">
              {loading ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">Qidirilmoqda...</div>
              ) : results.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-300">Natija topilmadi</div>
              ) : (
                <ul className="max-h-72 overflow-auto py-1">
                  {results.map((r) => (
                    <li
                      key={`${r.type}-${r.id}`}
                      onClick={() => {
                        setShowResults(false);
                        setQuery("");
                        // Navigate to appropriate page
                        if (r.type === "operator") {
                          navigate("/admin/users");
                        } else if (r.type === "application") {
                          navigate("/admin/applications");
                        } else if (r.type === "fillial") {
                          navigate("/admin/fillials");
                        }
                        // Then show modal
                        setTimeout(() => setSelected(r), 100);
                      }}
                      className="cursor-pointer px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-navy-700 dark:text-white">{r.title}</div>
                          {r.subtitle ? (
                            <div className="text-xs text-gray-600 dark:text-gray-300">{r.subtitle}</div>
                          ) : null}
                        </div>
                        <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          {r.type === "operator" ? "Operator" : r.type === "application" ? "Ariza" : "Filial"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>

        {/* start Horizon PRO */}
        <Dropdown
          button={
            <p className="cursor-pointer">
              <IoMdInformationCircleOutline className="h-4 w-4 text-gray-600 dark:text-white" />
            </p>
          }
          children={
            <div className="flex w-[350px] flex-col gap-3 rounded-[20px] bg-white p-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="mb-2">
                <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">Premium Nasiya</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Zamonaviy nasiya xizmatlarini taqdim etuvchi platforma. Tez va ishonchli nasiya olish imkoniyati.
                </p>
              </div>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://premiumnasiya.uz"
                className="px-full linear flex cursor-pointer items-center justify-center rounded-xl bg-brand-500 py-[11px] font-bold text-white transition duration-200 hover:bg-brand-600 hover:text-white active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Asosiy saytga o'tish
              </a>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Premium Nasiya Admin Panel
              </div>
            </div>
          }
          classNames={"py-2 top-6 -left-[250px] md:-left-[330px] w-max"}
          animation="origin-[75%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
        />
        <div
          className="cursor-pointer text-gray-600"
          onClick={() => {
            if (darkmode) {
              document.body.classList.remove("dark");
              setDarkmode(false);
            } else {
              document.body.classList.add("dark");
              setDarkmode(true);
            }
          }}
        >
          {darkmode ? (
            <RiSunFill className="h-4 w-4 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-4 w-4 text-gray-600 dark:text-white" />
          )}
        </div>
        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user?.image || avatar}
              alt={user?.fullname || "User"}
              title={`${user?.fullname ?? "User"}${user?.phone ? " • " + user.phone : ""}`}
            />
          }
          children={
            <div className="flex w-60 flex-col rounded-[20px] bg-white shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              {/* User info */}
              <div className="flex items-center gap-3 p-4">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user?.image || avatar}
                  alt={user?.fullname || "User"}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-navy-700 dark:text-white">{user?.fullname || "Anonim"}</div>
                  {user?.phone ? (
                    <div className="truncate text-xs text-gray-600 dark:text-gray-300">{user.phone}</div>
                  ) : null}
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20" />

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-white/10"
                >
                  Chiqish
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
        <DetailModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected ? (selected.type === "operator" ? "Operator ma'lumoti" : selected.type === "application" ? "Ariza ma'lumoti" : "Filial ma'lumoti") : undefined}
        >
          {selected && selected.type === "operator" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">F.I.Sh</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.fullname}</p>
                </div>
                {selected.raw.phone && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.phone}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.fillial?.name && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Filial</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.fillial.name}</p>
                  </div>
                )}
                {selected.raw.merchant?.name && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Merchant</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.merchant.name}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.role && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rol</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.role}</p>
                  </div>
                )}
                {selected.raw.work_status && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ish holati</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${selected.raw.work_status === 'WORKING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {selected.raw.work_status === 'WORKING' ? 'Faol' : 'Bloklangan'}
                    </span>
                  </div>
                )}
              </div>
              {selected.raw.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yaratilgan sana</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{new Date(selected.raw.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              )}
            </div>
          )}
          {selected && selected.type === "application" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ariza ID</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">#{selected.raw.id}</p>
                </div>
                {selected.raw.status && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Holat</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      selected.raw.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      selected.raw.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {selected.raw.status === 'APPROVED' ? 'Tasdiqlangan' : selected.raw.status === 'REJECTED' ? 'Rad etilgan' : 'Kutilmoqda'}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">F.I.Sh</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.fullname}</p>
                </div>
                {selected.raw.phone && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Telefon</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.phone}</p>
                  </div>
                )}
              </div>
              {selected.raw.passport && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pasport</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.passport}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.amount && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tovarlar summasi</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.amount.toLocaleString()} so'm</p>
                  </div>
                )}
                {selected.raw.payment_amount && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To'lov summasi</p>
                    <p className="text-sm font-bold text-brand-500 dark:text-brand-400">{selected.raw.payment_amount.toLocaleString()} so'm</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.percent && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Foiz</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.percent}%</p>
                  </div>
                )}
                {selected.raw.expired_month && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Muddat</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.expired_month} oy</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.paid !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To'lov holati</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${selected.raw.paid ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                      {selected.raw.paid ? "To'langan" : "To'lanmagan"}
                    </span>
                  </div>
                )}
              </div>
              {selected.raw.fillial?.name && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Filial</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.fillial.name}</p>
                </div>
              )}
              {selected.raw.user?.fullname && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Operator</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.user.fullname}</p>
                </div>
              )}
              {selected.raw.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yaratilgan sana</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{new Date(selected.raw.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              )}
            </div>
          )}
          {selected && selected.type === "fillial" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nomi</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.name}</p>
                </div>
                {selected.raw.region && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hudud</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.region}</p>
                  </div>
                )}
              </div>
              {selected.raw.address && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manzil</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {selected.raw.merchant?.name && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Merchant</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.merchant.name}</p>
                  </div>
                )}
                {selected.raw.work_status && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ish holati</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${selected.raw.work_status === 'WORKING' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {selected.raw.work_status === 'WORKING' ? 'Faol' : 'Bloklangan'}
                    </span>
                  </div>
                )}
              </div>
              {selected.raw.inn && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">INN</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.inn}</p>
                  </div>
                  {selected.raw.nds && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">NDS</p>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.nds}%</p>
                    </div>
                  )}
                </div>
              )}
              {selected.raw.director_name && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Direktor</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.director_name}</p>
                  </div>
                  {selected.raw.director_phone && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Direktor telefoni</p>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.director_phone}</p>
                    </div>
                  )}
                </div>
              )}
              {selected.raw.bank_name && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.bank_name}</p>
                </div>
              )}
              {selected.raw.hisob_raqam && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hisob raqam</p>
                    <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.hisob_raqam}</p>
                  </div>
                  {selected.raw.mfo && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MFO</p>
                      <p className="text-sm font-medium text-navy-700 dark:text-white">{selected.raw.mfo}</p>
                    </div>
                  )}
                </div>
              )}
              {selected.raw.createdAt && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Yaratilgan sana</p>
                  <p className="text-sm font-medium text-navy-700 dark:text-white">{new Date(selected.raw.createdAt).toLocaleString('uz-UZ')}</p>
                </div>
              )}
            </div>
          )}
        </DetailModal>
      </div>
    </nav>
  );
};

export default Navbar;
