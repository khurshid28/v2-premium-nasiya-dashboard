import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import apiReal from "lib/api";
import demoApi from "lib/demoApi";
import { formatPhone, formatMoney, formatMoneyWithUZS, appStatusBadge, formatDateNoSeconds } from "lib/formatters";
import Card from "components/card";

type Application = {
  id: number;
  fullname: string;
  phone?: string | null;
  phone2?: string | null;
  passport?: string | null;
  limit?: number | null;
  canceled_reason?: string | null;
  expired_month?: string | null;
  percent?: number | null;
  amount?: number | null;
  payment_amount?: number | null;
  status?: string | null;
  fillial_id?: number;
  bank_id?: number;
  bank?: { id: number; name: string } | null;
  request_id?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  merchant?: { id: number; name: string } | null;
  fillial?: { 
    id: number; 
    name: string; 
    region?: string;
    nds?: string;
    hisob_raqam?: string;
    bank_name?: string;
    mfo?: string;
    inn?: string;
    director_name?: string;
    director_phone?: string;
  } | null;
  user?: { id: number; fullname: string; phone?: string | null; image?: string | null } | null;
  myid_id?: number | null;
  paid?: boolean | null;
  payment_method?: string | null;
  fcmToken?: string | null;
  workplace?: {
    company_name?: string;
    position?: string;
    work_experience?: string;
    monthly_income?: number;
    address?: string;
    inn?: string;
    phone?: string;
    director_name?: string | null;
    work_schedule?: string;
  } | null;
  products?: { id: number; name: string; price: number; count?: number | null }[];
  payments?: {
    id: number;
    amount: number;
    provider: string;
    status: string;
    paymentType?: string;
    transactionId?: string;
    createdAt: string;
    client?: {
      id: number;
      full_name: string;
      phone: string;
    };
  }[];
  actionLogs?: {
    id: number;
    action_type: string;
    user_role: string;
    entity_type: string;
    entity_id: number;
    description?: string;
    metadata?: any;
    createdAt: string;
    user?: {
      id: number;
      fullname: string;
      phone?: string;
      role?: string;
    };
  }[];
  debtInfo?: {
    totalAmount: number;
    paidAmount: number;
    remainingDebt: number;
    overdueAmount: number;
    nextPaymentAmount: number;
    nextPaymentDate: string | null;
    monthlyPayment: number;
    totalMonths: number;
    completedMonths: number;
    remainingMonths: number;
    schedule: {
      monthNumber: number;
      dueDate: string;
      amount: number;
      paid: boolean;
      paidAmount: number;
      status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
      isOverdue: boolean;
      daysPastDue: number;
    }[];
  } | null;
};

const ApplicationDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const api = React.useMemo(() => {
    const isDemoMode = location.pathname.startsWith('/demo');
    return isDemoMode ? demoApi : apiReal;
  }, [location.pathname]);

  const [application, setApplication] = React.useState<Application | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'application' | 'merchant' | 'workplace' | 'debt' | 'payments' | 'history' | 'operations'>('application');

  React.useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('🔍 Fetching application:', id);
        const response = await api.getApplication(parseInt(id));
        console.log('✅ Application response:', response);
        console.log('   - workplace:', response.workplace);
        console.log('   - payments count:', response.payments?.length);
        console.log('   - actionLogs count:', response.actionLogs?.length);
        setApplication(response);
      } catch (error) {
        console.error('❌ Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, api]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Ariza topilmadi</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-5">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-600 transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <div>
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            Ariza #{application.id}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {application.fullname}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card extra="!p-0 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('application')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'application'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ariza
          </button>
          <button
            onClick={() => setActiveTab('merchant')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'merchant'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Merchant
          </button>
          <button
            onClick={() => setActiveTab('workplace')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'workplace'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Ish joyi
          </button>
          {/* Faqat CONFIRMED va FINISHED statuslarda Qarzdorlik tabini ko'rsatish */}
          {(application.status === 'CONFIRMED' || application.status === 'FINISHED') && (
            <button
              onClick={() => setActiveTab('debt')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'debt'
                  ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Qarzdorlik
            </button>
          )}
          {/* Faqat CONFIRMED va FINISHED statuslarda To'lovlar tabini ko'rsatish */}
          {(application.status === 'CONFIRMED' || application.status === 'FINISHED') && (
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              To'lovlar
            </button>
          )}
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            So'ndirish
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'operations'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Amaliyotlar
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'application' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ariza beruvchi</p>
                <div className="bg-gray-50 dark:bg-navy-800 p-4 rounded-lg space-y-2">
                  <p className="text-base font-medium text-navy-700 dark:text-white">{application.fullname}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{application.passport || '—'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatPhone(application.phone)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                {(() => {
                  const badge = appStatusBadge(application.status || '');
                  return <span className={badge.className}>{badge.label}</span>;
                })()}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">To'langan</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">
                  {application.paid ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-300">To'landi</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-300">To'lanmadi</span>
                  )}
                </p>
              </div>
              {(() => {
                const st = (application.status ?? "").toUpperCase();
                const isFinished = st === "FINISHED" || st === "COMPLETED" || st === "ACTIVE";
                if (isFinished && application.paid && application.payment_method) {
                  return (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">To'lov usuli</p>
                      <p className="text-base font-medium text-navy-700 dark:text-white">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          application.payment_method === "Sho't faktura"
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        }`}>
                          {application.payment_method}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Summa</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{formatMoneyWithUZS(application.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Limit</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{formatMoneyWithUZS(application.limit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Muddat</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{application.expired_month ? `${application.expired_month} oy` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Foiz</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{application.percent ? `${application.percent}%` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Yaratilgan</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{formatDateNoSeconds(application.createdAt)}</p>
              </div>
              {application.products && application.products.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Mahsulotlar</p>
                  <div className="space-y-2">
                    {application.products.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-800 rounded-lg">
                        <span className="text-sm font-medium text-navy-700 dark:text-white">{product.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">x{product.count || 1}</span>
                          <span className="text-sm font-medium text-navy-700 dark:text-white">{formatMoneyWithUZS(product.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'merchant' && (
            <div className="space-y-6">
              {/* Merchant & Fillial Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Merchant</p>
                  <p className="text-base font-medium text-navy-700 dark:text-white">{application.merchant?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fillial</p>
                  <p className="text-base font-medium text-navy-700 dark:text-white">{application.fillial?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hudud</p>
                  <p className="text-base font-medium text-navy-700 dark:text-white">{application.fillial?.region || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Agent</p>
                  <p className="text-base font-medium text-navy-700 dark:text-white">{application.user?.fullname || '—'}</p>
                </div>
                {application.user?.phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Agent telefoni</p>
                    <p className="text-base font-medium text-navy-700 dark:text-white">{formatPhone(application.user.phone)}</p>
                  </div>
                )}
              </div>

              {/* Fillial Bank Details */}
              {(application.fillial?.hisob_raqam || application.fillial?.inn || application.fillial?.mfo) && (
                <Card extra="p-5">
                  <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Fillial bank ma'lumotlari</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.fillial?.hisob_raqam && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hisob raqam</p>
                        <p className="text-base font-mono font-medium text-navy-700 dark:text-white">{application.fillial.hisob_raqam}</p>
                      </div>
                    )}
                    {application.fillial?.bank_name && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bank nomi</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">{application.fillial.bank_name}</p>
                      </div>
                    )}
                    {application.fillial?.inn && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">INN</p>
                        <p className="text-base font-mono font-medium text-navy-700 dark:text-white">{application.fillial.inn}</p>
                      </div>
                    )}
                    {application.fillial?.mfo && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">MFO</p>
                        <p className="text-base font-mono font-medium text-navy-700 dark:text-white">{application.fillial.mfo}</p>
                      </div>
                    )}
                    {application.fillial?.nds && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">NDS</p>
                        <p className="text-base font-mono font-medium text-navy-700 dark:text-white">{application.fillial.nds}</p>
                      </div>
                    )}
                    {application.fillial?.director_name && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Direktor</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">{application.fillial.director_name}</p>
                      </div>
                    )}
                    {application.fillial?.director_phone && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Direktor telefoni</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">{formatPhone(application.fillial.director_phone)}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'workplace' && (
            <div className="space-y-6">
              {application.workplace ? (
                <>
                  {/* Workplace Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Korxona nomi</p>
                      <p className="text-base font-medium text-navy-700 dark:text-white">{application.workplace.company_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Lavozim</p>
                      <p className="text-base font-medium text-navy-700 dark:text-white">{application.workplace.position || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ish tajribasi</p>
                      <p className="text-base font-medium text-navy-700 dark:text-white">
                        {application.workplace.work_experience ? `${application.workplace.work_experience} yil` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Oylik daromad</p>
                      <p className="text-base font-medium text-navy-700 dark:text-white">
                        {application.workplace.monthly_income ? formatMoneyWithUZS(application.workplace.monthly_income) : '—'}
                      </p>
                    </div>
                    {application.workplace.address && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manzil</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">{application.workplace.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  <Card extra="p-5">
                    <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">Qo'shimcha ma'lumotlar</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {application.workplace.inn && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">INN</p>
                          <p className="text-base font-mono font-medium text-navy-700 dark:text-white">{application.workplace.inn}</p>
                        </div>
                      )}
                      {application.workplace.phone && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Telefon</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">{formatPhone(application.workplace.phone)}</p>
                        </div>
                      )}
                      {application.workplace.director_name && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Rahbar</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">{application.workplace.director_name}</p>
                        </div>
                      )}
                      {application.workplace.work_schedule && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Ish tartibi</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">{application.workplace.work_schedule}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Ish joyi ma'lumotlari mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'debt' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jami summa</p>
                  <p className="text-xl font-bold text-navy-700 dark:text-white">
                    {application.debtInfo ? formatMoneyWithUZS(application.debtInfo.totalAmount) : formatMoneyWithUZS(application.amount || 0)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">To'langan</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {application.debtInfo ? formatMoneyWithUZS(application.debtInfo.paidAmount) : '0 so\'m'}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Qoldiq qarz</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {application.debtInfo ? formatMoneyWithUZS(application.debtInfo.remainingDebt) : formatMoneyWithUZS((application.amount || 0) - (application.payment_amount || 0))}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Muddati o'tgan</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {application.debtInfo ? formatMoneyWithUZS(application.debtInfo.overdueAmount) : '0 so\'m'}
                  </p>
                </div>
              </div>

              {/* Payment Schedule Table */}
              {application.debtInfo && application.debtInfo.schedule && application.debtInfo.schedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Oy</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">To'lov sanasi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Summa</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">To'langan</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Holat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.debtInfo.schedule.map((item) => {
                        const dueDate = new Date(item.dueDate);
                        const formattedDate = `${String(dueDate.getDate()).padStart(2, '0')}.${String(dueDate.getMonth() + 1).padStart(2, '0')}.${dueDate.getFullYear()}`;
                        
                        let statusLabel = 'Kutilmoqda';
                        let statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
                        
                        if (item.status === 'COMPLETED') {
                          statusLabel = 'To\'landi';
                          statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                        } else if (item.status === 'OVERDUE') {
                          statusLabel = `Kechikkan (${item.daysPastDue} kun)`;
                          statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                        }
                        
                        return (
                          <tr key={item.monthNumber} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {item.monthNumber === 0 ? 'Boshlang\'ich' : `${item.monthNumber}-oy`}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formattedDate}</td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                              {formatMoney(item.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                              {formatMoney(item.paidAmount)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-navy-800">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Jami:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-navy-700 dark:text-white">
                          {formatMoney(application.debtInfo.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatMoney(application.debtInfo.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {application.debtInfo.completedMonths} / {application.debtInfo.totalMonths}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">To'lov grafigi mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {application.expired_month && application.payment_amount ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Oy</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">To'lov sanasi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Oylik to'lov</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Holat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const months = parseInt(application.expired_month);
                        const monthlyPayment = Math.round(application.payment_amount / months);
                        const createdDate = application.createdAt ? new Date(application.createdAt) : new Date();
                        const currentDate = new Date();
                        
                        return Array.from({ length: months }, (_, index) => {
                          const monthNumber = index + 1;
                          const dueDate = new Date(createdDate);
                          dueDate.setMonth(dueDate.getMonth() + monthNumber);
                          
                          // Holat: o'tgan oy, joriy oy, kelgusi oy
                          const isPast = dueDate < currentDate;
                          const isCurrent = dueDate.getMonth() === currentDate.getMonth() && dueDate.getFullYear() === currentDate.getFullYear();
                          
                          let statusLabel = 'Kutilmoqda';
                          let statusClass = 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
                          
                          if (isPast) {
                            statusLabel = 'Muddati o\'tgan';
                            statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                          } else if (isCurrent) {
                            statusLabel = 'Joriy oy';
                            statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                          }
                          
                          return (
                            <tr key={monthNumber} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-navy-800">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{monthNumber}-oy</td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {String(dueDate.getDate()).padStart(2, '0')}.{String(dueDate.getMonth() + 1).padStart(2, '0')}.{dueDate.getFullYear()}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                {formatMoneyWithUZS(monthNumber === months ? application.payment_amount - (monthlyPayment * (months - 1)) : monthlyPayment)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                                  {statusLabel}
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-navy-800">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Jami:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatMoneyWithUZS(application.payment_amount)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {application.expired_month} oy
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">To'lov grafigi mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-navy-700 dark:text-white">So'ndirish (Amalga oshirilgan to'lovlar)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shu ariza uchun to'langan barcha to'lovlar</p>
              </div>
              {Array.isArray(application.payments) && application.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">№</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Sana</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Summa</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Provider</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">To'lov turi</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.payments.map((payment: any, index: number) => (
                        <tr key={payment.id || index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-navy-800">
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {payment.createdAt ? formatDateNoSeconds(payment.createdAt) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                            {formatMoneyWithUZS(payment.amount || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.provider === 'PAYME' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              payment.provider === 'PLUM' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              payment.provider === 'AUTO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              payment.provider === 'MIB' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              payment.provider === 'CLICK' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                              payment.provider === 'UZUM' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {payment.provider || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {payment.paymentType ? payment.paymentType.replace('_', ' ') : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              payment.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Muvaffaqiyatli' :
                               payment.status === 'PENDING' ? 'Kutilmoqda' :
                               payment.status === 'FAILED' ? 'Muvaffaqiyatsiz' :
                               payment.status || 'Noma\'lum'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-navy-800">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Jami to'langan:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatMoneyWithUZS(application.payments.filter((p: any) => p.status === 'COMPLETED').reduce((sum: number, p: any) => sum + (p.amount || 0), 0))}
                        </td>
                        <td colSpan={3} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {application.payments.filter((p: any) => p.status === 'COMPLETED').length} ta to'lov
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Hali to'lovlar amalga oshirilmagan</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'operations' && (
            <div>
              {application.actionLogs && application.actionLogs.length > 0 ? (
                <div className="space-y-4">
                  {application.actionLogs.map((log: any) => {
                    const date = new Date(log.createdAt);
                    const formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
                    const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    
                    // Action type labels (based on Prisma ActionType enum)
                    const actionTypeLabels: { [key: string]: { label: string; color: string } } = {
                      'CREATE': { label: 'Yaratildi', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                      'UPDATE': { label: 'Tahrirlandi', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
                      'DELETE': { label: 'O\'chirildi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
                      'VIEW': { label: 'Ko\'rib chiqildi', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
                      'CANCEL': { label: 'Bekor qilindi', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
                      'APPROVE': { label: 'Tasdiqlandi', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
                      'REJECT': { label: 'Rad etildi', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
                      'ADD_DETAIL': { label: 'Ma\'lumot qo\'shildi', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
                      'SEND_SCORING': { label: 'Skoring yuborildi', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
                      'CHECK_SCORING': { label: 'Skoring tekshirildi', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
                      'ADD_PRODUCT': { label: 'Mahsulot qo\'shildi', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                      'SELECT': { label: 'Tanlandi', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
                      'FINISH': { label: 'Yakunlandi', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                      'MERCHANT_PAY': { label: 'Merchant to\'lovi', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                      'GENERATE_GRAPH': { label: 'Grafik yaratildi', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
                    };
                    
                    const actionInfo = actionTypeLabels[log.action_type] || { label: log.action_type, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
                    
                    return (
                      <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                              {actionInfo.label}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formattedDate} {formattedTime}
                            </span>
                          </div>
                          
                          {/* User info */}
                          {log.user && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-white">{log.user.fullname}</span>
                                <span className="mx-2">•</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  log.user_role === 'SUPER' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  log.user_role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  log.user_role === 'AGENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  log.user_role === 'USER' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                }`}>
                                  {log.user_role}
                                </span>
                                {/* Bank name - faqat limit berish va tasdiqlash paytida */}
                                {application.bank && application.bank.name && 
                                 (log.action_type === 'CHECK_SCORING' || log.action_type === 'APPROVE' || log.action_type === 'SELECT') && (
                                  <>
                                    <span className="mx-2">•</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                      🏦 {application.bank.name}
                                    </span>
                                  </>
                                )}
                              </span>
                            </div>
                          )}
                          
                          {/* Description */}
                          {log.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{log.description}</p>
                          )}
                          
                          {/* Metadata */}
                          {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-3 space-y-1">
                              {Object.entries(log.metadata).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex items-start gap-2 text-sm">
                                  <span className="text-gray-500 dark:text-gray-400 min-w-[120px] font-medium">{key}:</span>
                                  <span className="text-gray-900 dark:text-white">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* IP and User Agent */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                            {log.ip_address && <span>IP: {log.ip_address}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Amaliyotlar tarixi mavjud emas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicationDetail;
