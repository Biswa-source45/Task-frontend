import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyLeaves, applyLeave, getMyBalance } from '../../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, LogOut, Calendar, Clock, Activity, User, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

/* ─── Confirm Dialog ─── */
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading = false }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white" showCloseButton={false}>
      <div className="bg-black px-6 py-5 flex items-center justify-between border-none">
        <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-white text-base font-bold tracking-tight">{title}</h2>
        </div>
        <button onClick={onClose} disabled={loading} className="text-white/70 hover:text-white transition-colors ml-4 flex-shrink-0 disabled:opacity-50" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white px-6 py-5">
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${danger ? 'bg-red-500' : 'bg-black'}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none disabled:opacity-50";
const btnBlackSolid = `${btnBase} bg-black text-white hover:bg-zinc-900`;
const btnBlackOutline = `${btnBase} border border-zinc-200 text-zinc-700 bg-white hover:bg-black hover:text-white hover:border-black`;

const EmployeeDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyError, setApplyError] = useState('');

  const [newLeave, setNewLeave] = useState({ leave_type: 'vacation leave', start_date: '', end_date: '', reason: '' });
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const fetchLock = React.useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'employee') {
      navigate('/login');
      return;
    }
    
    if (!fetchLock.current) {
      fetchLock.current = true;
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, balanceRes] = await Promise.all([getMyLeaves(), getMyBalance()]);
      setLeaves(leavesRes);
      setBalance(balanceRes);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyError('');
    setIsApplying(true);
    try {
      await applyLeave(newLeave);
      await fetchData();
      setIsApplyDialogOpen(false);
      setNewLeave({ leave_type: 'vacation leave', start_date: '', end_date: '', reason: '' });
    } catch (err) {
      setApplyError(err.response?.data?.detail || 'Failed to apply for leave. Please check your dates.');
    } finally {
      setIsApplying(false);
    }
  };

  // Determine if currently on leave
  const isOnLeave = leaves.some(leave => {
    if (leave.status !== 'approved') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    return today >= start && today <= end;
  });

  // Prevent early render crash
  if (loading && !user) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
      </div>
    );
  }

  // Safe name display
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'E';

  return (
    <div className="min-h-screen bg-slate-50">
      
      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => { logoutUser(); navigate('/login'); }}
        title="Sign Out"
        message="Are you sure you want to exit your portal? You will need to login again to apply for leave."
        confirmLabel="Sign Out"
        danger={true}
      />

      {/* Top Nav */}
      <header className="bg-white border-b border-zinc-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center relative">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg font-bold transition-colors ${isOnLeave ? 'bg-red-500 shadow-red-200' : 'bg-black shadow-zinc-200'}`}>
              {userInitial}
            </div>
            <div>
              <h1 className="text-lg font-bold text-black leading-none">Employee Portal</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-zinc-400">{user?.name || 'User'}</p>
                {isOnLeave && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-red-300 animate-pulse" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tight">On Leave Today</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Centered Date Badge */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm ${isOnLeave ? 'text-red-500 bg-red-50 border border-red-100 shadow-red-100/50' : 'text-zinc-500 bg-zinc-50 border border-zinc-100 shadow-zinc-100/30'}`}>
              {format(new Date(), 'MMMM d, yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className={`${btnBlackOutline} text-xs px-3 py-1.5 h-9`}
              onClick={() => navigate('/profile')}
            >
              <User className="w-3.5 h-4" /> Profile
            </button>
            <button className={`${btnBlackOutline} text-xs px-3 py-1.5 h-9`} onClick={() => setLogoutConfirmOpen(true)}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Balance Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <Calendar className="w-5 h-5 text-slate-900" />,
              label: 'Vacation Balance',
              value: balance?.vacation_remaining ?? 0,
              sub: `of ${balance?.vacation_total ?? 20} days`,
              accent: 'border-slate-900',
              valueClass: 'text-slate-900',
              delay: 0.1,
            },
            {
              icon: <Activity className="w-5 h-5 text-blue-600" />,
              label: 'Sick Leave (Monthly)',
              value: balance?.sick_remaining ?? 0,
              sub: `of ${balance?.sick_total_monthly ?? 3} days`,
              accent: 'border-blue-500',
              valueClass: 'text-blue-700',
              delay: 0.15,
            },
            {
              icon: <Clock className="w-5 h-5 text-amber-500" />,
              label: 'Extra/Penalty',
              value: balance?.extra_leave ?? 0,
              sub: 'days exceeded',
              accent: 'border-amber-400',
              valueClass: 'text-amber-600',
              delay: 0.2,
            },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: c.delay }}>
              <Card className={`border-l-4 ${c.accent} shadow-sm bg-white overflow-hidden`}>
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {c.icon}{c.label}
                  </div>
                  <CardTitle className={`text-3xl font-bold ${c.valueClass}`}>{c.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-400 font-medium">{c.sub}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action & Feed */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 border-zinc-100 shadow-sm rounded-2xl overflow-hidden bg-white p-0 py-0 gap-0">
            <CardHeader className="bg-black border-none flex flex-row items-center justify-between py-8 px-8 rounded-none">
              <div>
                <CardTitle className="text-white font-black tracking-tight text-2xl">My Applications</CardTitle>
                <CardDescription className="text-white/60 text-base mt-1">Track the lifecycle of your leave requests.</CardDescription>
              </div>
 
              <Dialog
                open={isApplyDialogOpen}
                onOpenChange={(o) => { setIsApplyDialogOpen(o); if (!o) { setApplyError(''); } }}
              >
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 cursor-pointer select-none bg-white text-black hover:bg-slate-100 shadow-lg active:scale-95">
                    <Plus className="w-5 h-5" /> Apply for Leave
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white" showCloseButton={false}>
                  <div className="bg-black px-6 py-5 flex justify-between items-center sm:max-w-md border-none">
                    <h2 className="text-white text-lg font-bold tracking-tight">New Leave Application</h2>
                    <button onClick={() => setIsApplyDialogOpen(false)} className="text-white/70 hover:text-white transition-colors ml-4 flex-shrink-0" aria-label="Close"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="bg-white p-6 md:pb-8">
                    <form onSubmit={handleApplyLeave} className="space-y-4">
                      {applyError && (
                        <div className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-3 text-xs font-bold flex items-center gap-3">
                           <AlertTriangle className="w-4 h-4 text-red-500" /> {applyError}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Leave Category</label>
                        <select
                          className="w-full px-3 py-3 text-sm rounded-lg border border-zinc-200 bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                          value={newLeave.leave_type}
                          onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                        >
                          <option value="vacation leave">Vacation Leave</option>
                          <option value="sick leave">Sick Leave</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Start Date</label>
                          <input type="date" required className="w-full px-3 py-3 text-sm rounded-lg border border-zinc-200 focus:ring-2 focus:ring-black focus:outline-none transition-all" value={newLeave.start_date} onChange={e => setNewLeave({ ...newLeave, start_date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">End Date</label>
                          <input type="date" required className="w-full px-3 py-3 text-sm rounded-lg border border-zinc-200 focus:ring-2 focus:ring-black focus:outline-none transition-all" value={newLeave.end_date} onChange={e => setNewLeave({ ...newLeave, end_date: e.target.value })} min={newLeave.start_date || new Date().toISOString().split('T')[0]} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description / Reason</label>
                        <textarea required className="w-full px-3 py-3 text-sm rounded-lg border border-zinc-200 focus:ring-2 focus:ring-black focus:outline-none transition-all resize-none" rows={2} value={newLeave.reason} onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Ex: Family vacation, Medical checkup..." />
                      </div>
                      <button type="submit" className={`${btnBlackSolid} w-full py-4 text-base h-auto mt-2 font-bold`} disabled={isApplying}>
                        {isApplying ? <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</> : 'Send Application'}
                      </button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-50/70">
                  <TableRow>
                    <TableHead className="pl-8">Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-8">Manager Feed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-24 text-zinc-400 font-medium italic">No applications initiated yet.</TableCell></TableRow>
                  ) : leaves.map((leave) => (
                    <TableRow key={leave.id} className="group">
                      <TableCell className="font-bold capitalize text-black pl-8 py-4">{leave.leave_type}</TableCell>
                      <TableCell className="text-zinc-500 text-xs font-medium">
                        {format(new Date(leave.start_date), 'MMM d')} – {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-black font-black text-sm">{leave.days}d</TableCell>
                      <TableCell>
                        <Badge className={`shadow-none border h-6 ${leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : leave.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400 italic text-[11px] max-w-xs truncate pr-8 group-hover:text-zinc-600 transition-colors">
                        {leave.manager_comment || 'Awaiting review...'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;
