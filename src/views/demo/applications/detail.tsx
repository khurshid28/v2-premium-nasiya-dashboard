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
  request_id?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  merchant?: { id: number; name: string } | null;
  fillial?: { id: number; name: string; region?: string } | null;
  user?: { id: number; fullname: string; phone?: string | null; image?: string | null } | null;
  myid_id?: number | null;
  paid?: boolean | null;
  fcmToken?: string | null;
  products?: { id: number; name: string; price: number; count?: number | null }[];
  payments?: { date: string; prAmount: number; totalAmount: number; remainingMainDebt: number; paid?: boolean }[];
  paymentHistory?: { id: string; date: string; amount: number; provider: string; transactionId?: string; status: string }[];
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
  const [activeTab, setActiveTab] = React.useState<'application' | 'merchant' | 'debt' | 'payments' | 'history'>('application');

  React.useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.getApplication(parseInt(id));
        setApplication(response);
      } catch (error) {
        console.error('Error fetching application:', error);
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
            onClick={() => setActiveTab('debt')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'debt'
                ? 'border-b-2 border-brand-500 text-brand-500 dark:text-brand-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Qarzdorlik
          </button>
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
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'application' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">F.I.O</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{application.fullname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Telefon</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{formatPhone(application.phone)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pasport</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{application.passport || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                {(() => {
                  const badge = appStatusBadge(application.status || '');
                  return <span className={badge.className}>{badge.label}</span>;
                })()}
              </div>
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
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">To'langan</p>
                <p className="text-base font-medium text-navy-700 dark:text-white">{application.paid ? 'Ha' : 'Yo\'q'}</p>
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
          )}

          {activeTab === 'debt' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Jami summa</p>
                <p className="text-xl font-bold text-navy-700 dark:text-white">{formatMoneyWithUZS(application.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">To'langan summa</p>
                <p className="text-xl font-bold text-green-500">{formatMoneyWithUZS(application.payment_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Qoldiq qarz</p>
                <p className="text-xl font-bold text-red-500">
                  {formatMoneyWithUZS((application.amount || 0) - (application.payment_amount || 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Muddat</p>
                <p className="text-xl font-bold text-navy-700 dark:text-white">{application.expired_month ? `${application.expired_month} oy` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Foiz stavkasi</p>
                <p className="text-xl font-bold text-navy-700 dark:text-white">{application.percent ? `${application.percent}%` : '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Holati</p>
                {(() => {
                  const badge = appStatusBadge(application.status || '');
                  return <span className={badge.className}>{badge.label}</span>;
                })()}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {application.payments && application.payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">№</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">To'lov sanasi</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Asosiy qarz</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Jami to'lov</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Qoldiq qarz</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">To'langan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(application.payments as any[]).map((payment, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-navy-800">
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {(() => {
                              const date = new Date(payment.date);
                              const day = String(date.getDate()).padStart(2, '0');
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const year = date.getFullYear();
                              return `${day}.${month}.${year}`;
                            })()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                            {formatMoneyWithUZS(payment.prAmount)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                            {formatMoneyWithUZS(payment.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                            {formatMoneyWithUZS(payment.remainingMainDebt)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {payment.paid ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"></span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-navy-800">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Jami:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                          {formatMoneyWithUZS((application.payments as any[]).reduce((sum, p) => sum + (p.prAmount || 0), 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatMoneyWithUZS((application.payments as any[]).reduce((sum, p) => sum + (p.totalAmount || 0), 0))}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-orange-600 dark:text-orange-400">
                          {application.payments.length > 0 ? formatMoneyWithUZS((application.payments as any[])[application.payments.length - 1].remainingMainDebt || 0) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {(application.payments as any[]).filter(p => p.paid).length} / {application.payments.length}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">To'lovlar tarixi mavjud emas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {React.useEffect(() => {
                console.log('=== SO\'NDIRISH TAB ===');
                console.log('Application ID:', application.id);
                console.log('Application data:', application);
                console.log('Has paymentHistory?', !!application.paymentHistory);
                console.log('PaymentHistory length:', application.paymentHistory?.length);
                console.log('PaymentHistory data:', application.paymentHistory);
              }, [application])}
              {application.paymentHistory && application.paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Sana</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Summa</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Provider</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Transaction ID</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {application.paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-navy-800">
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{payment.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {(() => {
                              const date = new Date(payment.date);
                              const day = String(date.getDate()).padStart(2, '0');
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const year = date.getFullYear();
                              const hours = String(date.getHours()).padStart(2, '0');
                              const minutes = String(date.getMinutes()).padStart(2, '0');
                              return `${day}.${month}.${year} ${hours}:${minutes}`;
                            })()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-green-600 dark:text-green-400">
                            {formatMoneyWithUZS(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.provider === 'PAYME' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              payment.provider === 'PLUM' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              payment.provider === 'AUTO' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              payment.provider === 'MIB' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {payment.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                            {payment.transactionId || '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {payment.status === 'completed' ? 'Muvaffaqiyatli' :
                               payment.status === 'pending' ? 'Kutilmoqda' :
                               payment.status === 'failed' ? 'Muvaffaqiyatsiz' : payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-navy-800">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Jami to'langan:</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          {formatMoneyWithUZS(application.paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
                        </td>
                        <td colSpan={3} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {application.paymentHistory.filter(p => p.status === 'completed').length} ta to'lov
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">So'ndirish tarixi mavjud emas</p>
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
