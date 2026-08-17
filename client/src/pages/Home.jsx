import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, CreditCard, History, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-12 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl space-y-8 relative z-10">
        
        {/* Welcome Dashboard Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-800 glass-card shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center space-x-5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400/40 shadow-xl shadow-sky-500/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-sky-500/20">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Welcome, <span className="text-sky-400">{user.username}</span> 👋
                  </h1>
                </div>
                <p className="text-slate-400 text-sm font-medium">{user.fullName} ({user.email})</p>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authenticated via HTTP-Only JWT Cookie</span>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-red-500/5"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Logout</span>
            </button>
          </div>

          {/* Quick Payment Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            {/* Make Payment Action Card */}
            <Link
              to="/payment"
              className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-sky-500/30 hover:border-sky-400 transition-all duration-200 shadow-lg hover:shadow-sky-500/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      Make a Payment
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
                      Stripe / Cash
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Purchase the ₹999 Premium Plan using Card (Stripe Checkout) or Cash / Pay Later option.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Payment History Action Card */}
            <Link
              to="/payment-history"
              className="group p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-indigo-500/30 hover:border-indigo-400 transition-all duration-200 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <History className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Payment History
                  </h3>
                  <p className="text-xs text-slate-400">
                    View your past transactions, payment status (Paid / Pending / Failed), and receipt details.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>View Transaction Logs</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
