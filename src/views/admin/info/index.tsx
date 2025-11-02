import React from "react";
import Card from "components/card";
import { MdInfo, MdCheckCircle, MdCancel, MdAccountBalanceWallet, MdWork, MdSupervisedUserCircle } from "react-icons/md";

const InfoPage = () => {
  return (
    <div className="mt-3 max-w-7xl mx-auto">
      {/* Header Card - Full Width with Animation */}
      <Card extra="p-8 bg-gradient-to-br from-brand-500 via-brand-600 to-purple-600 text-white mb-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.01]">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg animate-pulse">
            <MdInfo className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold drop-shadow-lg">🥳 PREMIUM NASIYA da Yangilik</h1>
            <p className="mt-2 text-lg text-white/90">Tizimdagi skoring talablari va shartlar</p>
          </div>
        </div>
      </Card>

      {/* Grid Layout - 3 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Age Requirements */}
        <Card extra="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-blue-500">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/30 shadow-md">
            <MdSupervisedUserCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Yosh bo'yicha chegara</h2>
        </div>
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
            <MdCheckCircle className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">18 yoshdan</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
            <MdCheckCircle className="h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
            <span className="text-base font-semibold text-gray-700 dark:text-gray-300">69 yoshgacha</span>
          </div>
        </div>
      </Card>

      {/* Limit Requirements */}
      <Card extra="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-green-500">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/30 shadow-md">
            <MdAccountBalanceWallet className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Limit Nasiya Summasi</h2>
        </div>
        <div className="space-y-3 pl-2">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <span className="text-3xl">💵</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Minimal summa</p>
              <p className="text-xl font-bold text-navy-700 dark:text-white">500 000 so'm dan</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
            <span className="text-3xl">💰</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Maksimal summa</p>
              <p className="text-xl font-bold text-navy-700 dark:text-white">20 000 000 so'm gacha</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">(Tovar + Nasiya Natsenka summa)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Work Requirements */}
      <Card extra="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-purple-500">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/30 shadow-md">
            <MdWork className="h-7 w-7 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Mijoz ish talabi</h2>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 via-purple-100/50 to-pink-50 dark:from-purple-900/20 dark:via-purple-800/10 dark:to-pink-900/10 p-5 shadow-md border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-4">
            <span className="text-4xl">🧑‍💻</span>
            <div>
              <p className="text-lg font-bold text-navy-700 dark:text-white">Rasmiy ishlab kelayotgan bo'lishi shart</p>
              <p className="mt-2 text-sm font-medium text-purple-600 dark:text-purple-400">⏱️ Kamida uzluksiz 6 oy davomida</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Rejection Reasons */}
      <Card extra="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-red-500">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 shadow-md">
            <MdCancel className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Rad qilish holatlari</h2>
        </div>
        <div className="space-y-4 pl-4">
          <div className="rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white font-bold">1</div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-navy-700 dark:text-white mb-2">Soliq hisoboti berilmagan</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Oxirgi 6 oy bo'yicha soliqqa (GNK/INPS) hisobot berilmagan bo'lsa
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white font-bold">2</div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-navy-700 dark:text-white mb-2">Salbiy kredit tarixi</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Kredit tarixi salbiy bo'lsa, kredit zayavkalari ko'p yoki muddati o'tgan qarzdorligi bo'lsa
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white font-bold">3</div>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-navy-700 dark:text-white mb-2">MIB dan qarzdorligi</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  MIB (Milliy Interbank) dan qarzdorligi mavjud bo'lsa
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Terms */}
      <Card extra="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-yellow-500">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/30 shadow-md">
            <span className="text-3xl">💸</span>
          </div>
          <h2 className="text-xl font-bold text-navy-700 dark:text-white">Nasiya muddatlari va ustamalari</h2>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-r from-green-50 via-green-100 to-emerald-50 dark:from-green-900/30 dark:via-green-800/20 dark:to-emerald-900/20 p-5 border-2 border-green-400 dark:border-green-700 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">12 oy muddatga</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">38%</p>
              </div>
              <MdCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-5 opacity-70 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">9 oy muddatga</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">0%</p>
              </div>
              <span className="text-5xl">❌</span>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-5 opacity-70 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">6 oy muddatga</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">0%</p>
              </div>
              <span className="text-5xl">❌</span>
            </div>
          </div>
          
          <div className="rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-5 opacity-70 border-2 border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">3 oy muddatga</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">0%</p>
              </div>
              <span className="text-5xl">❌</span>
            </div>
          </div>
        </div>
      </Card>
      </div> {/* End of grid */}
    </div>
  );
};

export default InfoPage;
