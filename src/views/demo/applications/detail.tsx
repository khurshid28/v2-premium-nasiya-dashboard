import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import apiReal from "lib/api";
import demoApi from "lib/demoApi";
import { formatPhone, formatMoney, formatMoneyWithUZS, appStatusBadge, formatDateNoSeconds } from "lib/formatters";
import Card from "components/card";
import Toast from "components/toast/Toast";

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
  myid?: {
    id: number;
    response_id?: string | null;
    comparison_value?: number | null;
    passport?: string | null;
    profile?: any;
    createdAt?: string;
    updatedAt?: string;
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
  const [activeTab, setActiveTab] = React.useState<'application' | 'merchant' | 'workplace' | 'client' | 'debt' | 'payments' | 'history' | 'operations'>('application');
  const [toast, setToast] = React.useState<{ show: boolean; message: string; type: 'main' | 'success' | 'error' }>({ 
    show: false, 
    message: '', 
    type: 'main' 
  });
  const [myidImageUrl, setMyidImageUrl] = React.useState<string | null>(null);
  const [myidImageError, setMyidImageError] = React.useState(false);

  // Load MyID image with token
  React.useEffect(() => {
    const loadMyidImage = async () => {
      if (!application?.myid?.id || !application?.passport) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMyidImageError(true);
          return;
        }

        const imageUrl = `http://localhost:7777/myid/${application.passport}-${application.myid.id}.png`;
        const response = await fetch(imageUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setMyidImageUrl(objectUrl);
          setMyidImageError(false);
        } else {
          setMyidImageError(true);
        }
      } catch (error) {
        console.error('Error loading MyID image:', error);
        setMyidImageError(true);
      }
    };

    if (application) {
      loadMyidImage();
    }

    // Cleanup
    return () => {
      if (myidImageUrl) {
        URL.revokeObjectURL(myidImageUrl);
      }
    };
  }, [application]);

  React.useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('🔍 Fetching application:', id);
        const response = await api.getApplication(parseInt(id));
        console.log('✅ Application response:', response);
        console.log('   - workplace:', response.workplace);
        console.log('   - myid:', response.myid);
        console.log('   - myid.profile:', response.myid?.profile);
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
            {location.pathname.includes('/contract/') ? 'Shartnoma' : 'Ariza'} #{application.id}
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
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'client'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Mijoz ma'lumotlari
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

              {/* Hujjatlarni yuklash */}
              <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Hujjatlar</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      try {
                        setToast({ show: true, message: 'Oferta yuklanmoqda...', type: 'main' });
                        const blob = await api.downloadOferta(application.id);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `oferta-${application.id}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        setToast({ show: true, message: 'Oferta muvaffaqiyatli yuklandi', type: 'success' });
                      } catch (error: any) {
                        console.error('Oferta yuklab olishda xatolik:', error);
                        const errorMessage = error?.message || 'Oferta yuklab olishda xatolik yuz berdi';
                        setToast({ 
                          show: true, 
                          message: errorMessage.includes('topilmadi') || errorMessage.includes('404') 
                            ? `Oferta-${application.id}.pdf fayli topilmadi` 
                            : errorMessage,
                          type: 'error'
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Oferta yuklash
                  </button>
                  
                  {(application.status === 'CONFIRMED' || application.status === 'FINISHED') && (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            setToast({ show: true, message: 'Shartnoma yuklanmoqda...', type: 'main' });
                            const blob = await api.downloadShartnoma(application.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `shartnoma-${application.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            setToast({ show: true, message: 'Shartnoma muvaffaqiyatli yuklandi', type: 'success' });
                          } catch (error: any) {
                            console.error('Shartnoma yuklab olishda xatolik:', error);
                            const errorMessage = error?.message || 'Shartnoma yuklab olishda xatolik yuz berdi';
                            setToast({ 
                              show: true, 
                              message: errorMessage.includes('topilmadi') || errorMessage.includes('404') 
                                ? `Shartnoma-${application.id}.pdf fayli topilmadi` 
                                : errorMessage,
                              type: 'error'
                            });
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Shartnoma yuklash
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            setToast({ show: true, message: 'Grafik yuklanmoqda...', type: 'main' });
                            const blob = await api.downloadGraph(application.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `graph-${application.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            setToast({ show: true, message: 'Grafik muvaffaqiyatli yuklandi', type: 'success' });
                          } catch (error: any) {
                            console.error('Grafik yuklab olishda xatolik:', error);
                            const errorMessage = error?.message || 'Grafik yuklab olishda xatolik yuz berdi';
                            setToast({ 
                              show: true, 
                              message: errorMessage.includes('topilmadi') || errorMessage.includes('404') 
                                ? `Graph-${application.id}.pdf fayli topilmadi` 
                                : errorMessage,
                              type: 'error'
                            });
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Grafik yuklash
                      </button>
                    </>
                  )}
                </div>
              </div>
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

          {activeTab === 'client' && (
            <div className="space-y-4">
              {application.myid?.profile ? (
                <>
                  {/* MyID Image and Comparison */}
                  {(application.myid.comparison_value || application.myid.id) && (
                    <Card extra="p-6">
                      <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">MyID Verifikatsiya</h5>
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* MyID Selfie Image */}
                        {application.myid.id && application.passport && (
                          <div className="flex flex-col items-center">
                            {myidImageError ? (
                              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Rasm topilmadi</p>
                              </div>
                            ) : myidImageUrl ? (
                              <img 
                                src={myidImageUrl}
                                alt="MyID Selfie"
                                className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                              />
                            ) : (
                              <div className="w-48 h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">MyID Selfie</p>
                          </div>
                        )}
                        
                        {/* Comparison Value */}
                        {application.myid.comparison_value && (
                          <div className="flex-1">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">O'xshashlik darajasi</p>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div 
                                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${application.myid.comparison_value * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {(application.myid.comparison_value * 100).toFixed(1)}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {application.myid.comparison_value >= 0.8 ? '✅ Tasdiqlangan' : 
                                 application.myid.comparison_value >= 0.6 ? '⚠️ Qoniqarli' : '❌ Rad etilgan'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Shaxsiy ma'lumotlar */}
                  <Card extra="p-6">
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Shaxsiy ma'lumotlar</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PINFL</p>
                        <p className="text-base font-mono font-semibold text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.pinfl || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">F.I.O (Lotin)</p>
                        <p className="text-base font-semibold text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.last_name_en} {application.myid.profile.common_data?.first_name_en}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">F.I.O (Kirill)</p>
                        <p className="text-base font-semibold text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.last_name} {application.myid.profile.common_data?.first_name} {application.myid.profile.common_data?.middle_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tug'ilgan sana</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.birth_date || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tug'ilgan joy</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.birth_place || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Jinsi</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.gender === '1' ? 'Erkak' : application.myid.profile.common_data?.gender === '2' ? 'Ayol' : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Millati</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.nationality || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fuqaroligi</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.common_data?.citizenship || '-'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Pasport ma'lumotlari */}
                  <Card extra="p-6">
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Pasport ma'lumotlari</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pasport seriyasi va raqami</p>
                        <p className="text-base font-mono font-bold text-navy-700 dark:text-white">
                          {application.myid.profile.doc_data?.pass_data || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hujjat turi</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.doc_data?.doc_type || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Berilgan sana</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.doc_data?.issued_date || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Amal qilish muddati</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.doc_data?.expiry_date || '-'}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Kim tomonidan berilgan</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.doc_data?.issued_by || '-'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Aloqa ma'lumotlari */}
                  <Card extra="p-6">
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Aloqa ma'lumotlari</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Telefon raqami</p>
                        <p className="text-base font-mono font-semibold text-navy-700 dark:text-white">
                          {application.phone ? formatPhone(application.phone) : (application.myid.profile.contacts?.phone ? `+998 ${application.myid.profile.contacts.phone}` : '-')}
                        </p>
                      </div>
                      {application.phone2 && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Qo'shimcha telefon</p>
                          <p className="text-base font-mono font-semibold text-navy-700 dark:text-white">
                            {formatPhone(application.phone2)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.contacts?.email || '-'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Doimiy yashash manzili */}
                  <Card extra="p-6">
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Doimiy yashash manzili</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manzil</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.address || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Viloyat</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.region || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tuman</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.district || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">MFY</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.mfy || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Kadastr raqami</p>
                        <p className="text-base font-mono font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.cadastre || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ro'yxatga olingan sana</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.address?.permanent_registration?.registration_date 
                            ? new Date(application.myid.profile.address.permanent_registration.registration_date).toLocaleDateString('uz-UZ')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Vaqtinchalik yashash manzili */}
                  {application.myid.profile.address?.temporary_registration && (
                    <Card extra="p-6">
                      <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Vaqtinchalik yashash manzili</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Manzil</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.address || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Viloyat</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.region || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Tuman</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.district || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">MFY</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.mfy || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Kadastr raqami</p>
                          <p className="text-base font-mono font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.cadastre || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Amal qilish muddati</p>
                          <p className="text-base font-medium text-navy-700 dark:text-white">
                            {application.myid.profile.address.temporary_registration.date_from && application.myid.profile.address.temporary_registration.date_till
                              ? `${new Date(application.myid.profile.address.temporary_registration.date_from).toLocaleDateString('uz-UZ')} - ${new Date(application.myid.profile.address.temporary_registration.date_till).toLocaleDateString('uz-UZ')}`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* MyID ma'lumotlari */}
                  <Card extra="p-6">
                    <h5 className="text-lg font-bold text-navy-700 dark:text-white mb-4">MyID ma'lumotlari</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Response ID</p>
                        <p className="text-base font-mono text-xs text-navy-700 dark:text-white break-all">
                          {application.myid.response_id || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Taqqoslash qiymati</p>
                        <p className="text-base font-semibold text-navy-700 dark:text-white">
                          {application.myid.comparison_value ? `${(application.myid.comparison_value * 100).toFixed(1)}%` : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Autentifikatsiya usuli</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.profile.authentication_method === 'strong' ? 'Kuchli' : application.myid.profile.authentication_method || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Tekshirilgan sana</p>
                        <p className="text-base font-medium text-navy-700 dark:text-white">
                          {application.myid.createdAt ? formatDateNoSeconds(application.myid.createdAt) : '-'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Mijoz ma'lumotlari mavjud emas</p>
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
                            <div className="mt-3 p-3 bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(log.metadata).map(([key, value]: [string, any]) => {
                                  // Key nomlarini o'zbekchaga o'girish
                                  const keyLabels: Record<string, string> = {
                                    clientId: 'Mijoz ID',
                                    passport: 'Pasport',
                                    isNewClient: 'Yangi mijoz',
                                    limit: 'Limit',
                                    bank: 'Bank',
                                    bankId: 'Bank ID',
                                    expired_month: 'Muddat (oy)',
                                    percent: 'Foiz',
                                    amount: 'Summa',
                                    payment_amount: 'To\'lov summasi',
                                    reason: 'Sabab',
                                    status: 'Status',
                                    productCount: 'Mahsulotlar soni',
                                    totalPrice: 'Umumiy narx',
                                  };
                                  
                                  const label = keyLabels[key] || key;
                                  
                                  // Value formatlash
                                  let displayValue: any = value;
                                  if (typeof value === 'boolean') {
                                    displayValue = value ? (
                                      <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        Ha
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                                        Yo'q
                                      </span>
                                    );
                                  } else if (key === 'limit' || key === 'amount' || key === 'payment_amount' || key === 'totalPrice') {
                                    displayValue = formatMoneyWithUZS(Number(value));
                                  } else if (typeof value === 'object') {
                                    displayValue = JSON.stringify(value, null, 2);
                                  } else {
                                    displayValue = String(value);
                                  }
                                  
                                  return (
                                    <div key={key} className="flex flex-col gap-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                                        {label}
                                      </span>
                                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                                        {displayValue}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
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

      {/* Toast Notification */}
      <Toast
        isOpen={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default ApplicationDetail;
