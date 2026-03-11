import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyBalance, getMyLeaves, getEmployeeBalance, getEmployeeLeaves } from '../../api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Loader2, ArrowLeft, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

const btnBlackGhost = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer select-none";

const StatCard = ({ label, value, subLabel, colorClass, bgClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`${bgClass} rounded-2xl p-5 border border-slate-100/50`}
  >
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    {subLabel && <p className="text-xs text-slate-400 mt-1">{subLabel}</p>}
  </motion.div>
);

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const employeeId = searchParams.get('id') || user?.id;
  const urlName = searchParams.get('name');
  const isManagerViewing = user?.role === 'manager' && employeeId !== user?.id;

  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calMonth, setCalMonth] = useState(new Date());
  
  // Track last fetched ID to prevent redundant calls
  const lastFetchedId = React.useRef(null);

  useEffect(() => {
    if (!user) {
      if (!loading) navigate('/login');
      return;
    }

    // Only fetch if employeeId has changed or not yet fetched
    if (lastFetchedId.current === employeeId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        lastFetchedId.current = employeeId;
        
        let balData, leavesData;
        if (isManagerViewing) {
          [balData, leavesData] = await Promise.all([
            getEmployeeBalance(employeeId),
            getEmployeeLeaves(employeeId),
          ]);
        } else {
          [balData, leavesData] = await Promise.all([
            getMyBalance(),
            getMyLeaves(),
          ]);
        }
        setBalance(balData);
        setLeaves(leavesData);
      } catch (err) {
        console.error(err);
        lastFetchedId.current = null; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [user, employeeId, isManagerViewing]);

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  const displayName = urlName
    ? decodeURIComponent(urlName)
    : (balance?.employee_name || (isManagerViewing ? 'Employee' : user?.name) || 'Employee Profile');

  const approvedDays = [];
  const pendingDays = [];
  leaves.forEach(leave => {
    if (leave.status === 'approved' || leave.status === 'pending') {
      try {
        const days = eachDayOfInterval({ start: parseISO(leave.start_date), end: parseISO(leave.end_date) });
        if (leave.status === 'approved') approvedDays.push(...days);
        if (leave.status === 'pending') pendingDays.push(...days);
      } catch (e) {
        console.error('Date parse error', e);
      }
    }
  });

  const isOnLeave = approvedDays.some(date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center relative">
          <button className={btnBlackGhost} onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-slate-200 ml-4 mr-4">|</span>
          <span className="text-sm text-slate-500 font-medium">{isManagerViewing ? 'Employee Profile' : 'My Profile'}</span>
          
          {/* Centered Date Badge */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
            <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm ${isOnLeave ? 'text-red-500 bg-red-50 border border-red-100 shadow-red-100/50' : 'text-slate-400 bg-slate-50 border border-slate-100 shadow-slate-100/30'}`}>
              {format(new Date(), 'MMMM d, yyyy')}
            </span>
          </div>

          <div className="ml-auto" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Profile hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden"
        >
          <div className={`w-20 h-20 rounded-2xl flex shrink-0 items-center justify-center text-white text-3xl font-bold shadow-md ${isOnLeave ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-br from-violet-500 to-blue-500 shadow-violet-500/20'}`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnLeave ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-sm text-slate-500">{isOnLeave ? 'Currently Out of Office' : 'Active Employee'}</span>
            </div>
          </div>
          {isManagerViewing && (
            <div className="px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-xl text-xs font-medium text-violet-600">
              Manager View
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Vacation Remaining" value={balance?.vacation_remaining ?? 0} subLabel={`of ${balance?.vacation_total ?? 20} days`} colorClass="text-violet-700" bgClass="bg-violet-50" delay={0.1} />
          <StatCard label="Vacation Used" value={balance?.vacation_used ?? 0} subLabel="days taken" colorClass="text-blue-700" bgClass="bg-blue-50" delay={0.15} />
          <StatCard label="Sick Leave Left" value={balance?.sick_remaining ?? 0} subLabel={`of ${balance?.sick_total_monthly ?? 3} monthly`} colorClass="text-emerald-700" bgClass="bg-emerald-50" delay={0.2} />
          <StatCard label="Extra Leaves" value={balance?.extra_leave ?? 0} subLabel="penalty days" colorClass="text-rose-700" bgClass="bg-rose-50" delay={0.25} />
        </div>

        {/* Calendar — Big single month view */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-5 h-5 text-violet-500" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Leave Calendar</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Visual overview of approved and pending leaves</p>
                </div>
             </div>
             {/* Simple legend in header for more space */}
             <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /> Approved</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400" /> Pending</div>
             </div>
          </div>
          <div className="p-10 flex flex-col items-center justify-center">
              <div className="w-full max-w-4xl bg-white rounded-[2rem] p-12 border border-slate-100 shadow-sm flex flex-col items-center">
                <Calendar
                  mode="multiple"
                  selected={[...approvedDays, ...pendingDays]}
                  month={calMonth}
                  onMonthChange={setCalMonth}
                  numberOfMonths={1}
                  modifiers={{ approved: approvedDays, pending: pendingDays }}
                  modifiersClassNames={{
                    approved: 'bg-red-500 text-white hover:bg-red-600 !opacity-100 rounded-2xl shadow-sm',
                    pending: 'bg-amber-400 text-white hover:bg-amber-500 !opacity-100 rounded-2xl shadow-sm',
                  }}
                  className="p-0 border-0"
                  classNames={{
                    root: 'flex justify-center',
                    months: 'flex flex-col',
                    month: 'space-y-12',
                    month_caption: 'flex items-center justify-between w-full mb-8 px-6',
                    caption_label: 'text-3xl font-black text-slate-900 tracking-tight',
                    nav: 'flex items-center gap-4',
                    button_previous: 'h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl hover:bg-black hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center',
                    button_next: 'h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl hover:bg-black hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center',
                    table: 'border-separate border-spacing-3',
                    head_row: 'flex w-full',
                    weekday: 'text-slate-900 w-full font-bold text-xs py-4 text-center uppercase tracking-[0.2em] opacity-50',
                    week: 'flex w-full mt-1',
                    day: 'p-0 flex items-center justify-center',
                    day_button: 'h-14 w-14 flex items-center justify-center font-bold text-base rounded-2xl border-2 border-transparent hover:border-black transition-all duration-300 text-slate-900',
                    today: `${isOnLeave ? 'bg-red-100 text-red-600' : 'bg-slate-300 text-violet-600'} font-black border-2 ${isOnLeave ? 'border-red-200' : 'border-violet-100'} shadow-sm rounded-2xl`,
                    outside: 'text-slate-100 opacity-5 pointer-events-none',
                    disabled: 'text-slate-100 opacity-5 pointer-events-none',
                  }}
                />
              </div>
          </div>
        </motion.div>

        {/* Leave History Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-violet-500" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Detailed Leave History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Full record of leave requests</p>
            </div>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="pl-8">Date Applied</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-8">Manager Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-slate-400">No leave history available.</TableCell>
                </TableRow>
              ) : leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="text-slate-500 text-sm pl-8">{format(new Date(leave.created_at), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="font-medium capitalize text-slate-800">{leave.leave_type}</TableCell>
                  <TableCell className="text-slate-600 text-sm whitespace-nowrap">
                    {format(new Date(leave.start_date), 'd MMM')} – {format(new Date(leave.end_date), 'd MMM yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{leave.days} days</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-none hover:bg-emerald-100' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200 shadow-none hover:bg-red-100' :
                            'bg-amber-100 text-amber-700 border border-amber-200 shadow-none hover:bg-amber-100'
                      }
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 italic text-sm truncate max-w-[220px] pr-6">
                    {leave.manager_comment || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;
