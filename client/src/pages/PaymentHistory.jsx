import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPaymentHistory } from '../services/paymentService';
import { History, CreditCard, Banknote, Loader2, PlusCircle, AlertCircle } from 'lucide-react';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getPaymentHistory();
        if (data && data.payments) {
          setPayments(data.payments);
        }
      } catch (err) {
        console.error('Fetch Payment History Error:', err);
        setError('Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
        <div className="flex items-center space-x-3 text-sky-400 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
          <span className="font-medium text-slate-200">Loading payment history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-12 bg-slate-950 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Payment History</h1>
            </div>
            <p className="text-xs text-slate-400">
              View your past payment transactions and billing receipts.
            </p>
          </div>

          <Link
            to="/payment"
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Make New Payment</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment History Table / Cards */}
        {payments.length === 0 ? (
          <div className="p-12 rounded-3xl border border-slate-800 glass-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mx-auto">
              <History className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No payment transactions yet</h3>
              <p className="text-xs text-slate-400">
                You haven't made any card or cash payments yet.
              </p>
            </div>
            <Link
              to="/payment"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-all"
            >
              <span>Make First Payment</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 glass-card overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Payment ID</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Payment ID */}
                      <td className="py-4 px-6 font-mono text-slate-300 font-semibold">
                        {p._id}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-bold text-sky-400 text-sm">
                        ₹{p.amount}
                      </td>

                      {/* Method */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          {p.paymentMethod === 'card' ? (
                            <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span className="uppercase text-[10px] font-bold">{p.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            p.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : p.paymentStatus === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentHistory;
