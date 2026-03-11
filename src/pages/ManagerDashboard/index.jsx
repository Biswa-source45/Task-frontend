import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees, createEmployee, deleteEmployee, getAllLeaves, updateLeaveStatus, deleteLeave, getMyLeaves } from '../../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Trash2, User, LogOut, LayoutDashboard, Users, X, AlertTriangle } from 'lucide-react';
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
        <button
          onClick={onClose}
          disabled={loading}
          className="text-white/70 hover:text-white transition-colors ml-4 flex-shrink-0 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white px-6 py-5">
        <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-black hover:text-white hover:border-black transition-all duration-200 disabled:opacity-50"
          >
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

/* ─── Button Styles ── */
const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none disabled:opacity-50";
const btnBlackSolid = `${btnBase} bg-black text-white hover:bg-zinc-900`;
const btnBlackOutline = `${btnBase} border border-zinc-200 text-zinc-700 bg-white hover:bg-black hover:text-white hover:border-black`;

const ManagerDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // States
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  
  const [activeTab, setActiveTab] = useState('applications');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [managerComment, setManagerComment] = useState('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Confirmations
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteEmpConfirm, setDeleteEmpConfirm] = useState({ open: false, id: null, name: '' });
  const [deleteLeaveConfirm, setDeleteLeaveConfirm] = useState({ open: false, id: null });
  const [approveConfirm, setApproveConfirm] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);
  
  // Action Loading
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLock = React.useRef(false);

  useEffect(() => {
    if (!user || user.role !== 'manager') {
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
      const [empRes, leaveRes, myLeavesRes] = await Promise.all([getEmployees(), getAllLeaves(), getMyLeaves()]);
      setEmployees(empRes);
      setLeaves(leaveRes);
      setMyLeaves(myLeavesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError('');
    try {
      await createEmployee(newEmployee);
      await fetchData();
      setIsAddDialogOpen(false);
      setNewEmployee({ name: '', email: '', password: '' });
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to create employee.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      setActionLoading(true);
      await deleteEmployee(deleteEmpConfirm.id);
      await fetchData();
      setDeleteEmpConfirm({ open: false, id: null, name: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLeaveRecord = async () => {
    try {
      setActionLoading(true);
      await deleteLeave(deleteLeaveConfirm.id);
      await fetchData();
      setDeleteLeaveConfirm({ open: false, id: null });
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveAction = async (status) => {
    try {
      setActionLoading(true);
      await updateLeaveStatus(selectedLeave.id, status, managerComment);
      await fetchData();
      setIsActionDialogOpen(false);
      setManagerComment('');
      setSelectedLeave(null);
      setApproveConfirm(false);
      setRejectConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Determine if manager themselves is on leave
  const isOnLeave = myLeaves.some(l => {
    if (l.status !== 'approved') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(l.start_date);
    const end = new Date(l.end_date);
    return today >= start && today <= end;
  });

  if (loading) {
    return (
      <div className="flex bg-slate-50 min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
      </div>
    );
  }

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Confirmation Modals ── */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => { logoutUser(); navigate('/login'); }}
        title="Sign Out"
        message="Are you sure you want to sign out? Your current session will be ended."
        confirmLabel="Sign Out"
        danger={true}
      />

      <ConfirmDialog
        open={deleteEmpConfirm.open}
        onClose={() => setDeleteEmpConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDeleteEmployee}
        loading={actionLoading}
        title="Delete Employee"
        message={`This will permanently delete ${deleteEmpConfirm.name} and all their leave history. This action cannot be undone.`}
        confirmLabel="Delete"
        danger={true}
      />

      <ConfirmDialog
        open={deleteLeaveConfirm.open}
        onClose={() => setDeleteLeaveConfirm({ open: false, id: null })}
        onConfirm={handleDeleteLeaveRecord}
        loading={actionLoading}
        title="Delete Leave Record"
        message="Are you sure you want to delete this leave record from the history?"
        confirmLabel="Delete"
        danger={true}
      />

      {selectedLeave && (
        <>
          <ConfirmDialog
            open={approveConfirm}
            onClose={() => setApproveConfirm(false)}
            onConfirm={() => handleLeaveAction('approved')}
            loading={actionLoading}
            title="Approve Leave"
            message={`Approve ${selectedLeave.days} day(s) of ${selectedLeave.leave_type} for ${selectedLeave.employee_name}? An approval email will be sent to the employee.`}
            confirmLabel="Approve"
          />
          <ConfirmDialog
            open={rejectConfirm}
            onClose={() => setRejectConfirm(false)}
            onConfirm={() => handleLeaveAction('rejected')}
            loading={actionLoading}
            title="Reject Leave"
            message={`Reject the leave request from ${selectedLeave.employee_name}? They will be notified via email with your comments.`}
            confirmLabel="Reject"
            danger={true}
          />
        </>
      )}

      {/* ── Top Nav ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center relative">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors ${isOnLeave ? 'bg-red-500 shadow-red-200' : 'bg-slate-900 shadow-slate-200'}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Manager Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-slate-400">Hello, {user?.name || 'Administrator'}</p>
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
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:block text-center">
            <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full transition-all duration-300 shadow-sm ${isOnLeave ? 'text-red-500 bg-red-50 border border-red-100 shadow-red-100/50' : 'text-slate-400 bg-slate-50 border border-slate-100 shadow-slate-100/30'}`}>
              {format(new Date(), 'MMMM d, yyyy')}
            </span>
          </div>

          <button
            className={`${btnBlackOutline} text-xs px-3 py-1.5 h-9 ml-auto`}
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Registered Team', value: employees.length, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'Action Required', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Requests', value: leaves.length, color: 'text-slate-600', bg: 'bg-white' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${s.bg} rounded-2xl p-6 border border-slate-100 shadow-sm`}>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="bg-white border border-slate-100 p-1 rounded-xl shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2.5 ${activeTab === 'applications' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-black hover:text-white'}`}
          >
            Leave Applications
            {pendingCount > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'employees' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-black hover:text-white'}`}
          >
            Manage Employees
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <motion.div key="apps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white p-0 py-0 gap-0">
                <CardHeader className="py-8 px-8 bg-black border-none rounded-none">
                  <CardTitle className="text-white font-black text-3xl tracking-tight">Leave Feed</CardTitle>
                  <CardDescription className="text-white/60 font-medium text-base mt-1">Track and review all employee leave movements.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/70">
                      <TableRow>
                        <TableHead className="pl-8">Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="pr-8 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="py-20 text-center text-slate-400">No leave requests found.</TableCell></TableRow>
                      ) : leaves.map((leave) => (
                        <TableRow key={leave.id} className="group">
                          <TableCell className="pl-8 font-semibold text-slate-900 py-4">{leave.employee_name}</TableCell>
                          <TableCell className="capitalize text-slate-600 font-medium">{leave.leave_type}</TableCell>
                          <TableCell className="text-slate-500 text-xs font-medium whitespace-nowrap">
                            {format(new Date(leave.start_date), 'MMM d')} – {format(new Date(leave.end_date), 'MMM d, yyyy')}
                            <span className="ml-2 text-slate-300 font-normal">({leave.days}d)</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`shadow-none border h-6 ${leave.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : leave.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-8 text-right">
                             {leave.status === 'pending' ? (
                               <button className={`${btnBlackOutline} py-1.5 px-3 text-xs h-8`} onClick={() => { setSelectedLeave(leave); setIsActionDialogOpen(true); }}>
                                 Review Request
                               </button>
                             ) : (
                               <div className="flex items-center justify-end gap-3 translate-x-1 group-hover:translate-x-0 transition-transform duration-300">
                                  <span className="text-xs text-slate-300 italic truncate max-w-[120px]">{leave.manager_comment || 'No comment'}</span>
                                  <button onClick={() => setDeleteLeaveConfirm({ open: true, id: leave.id })} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                             )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Employees Tab */}
          {activeTab === 'employees' && (
            <motion.div key="emps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6 px-1">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Team Directory</h2>
                  <p className="text-sm text-slate-400 mt-0.5">{employees.length} employees registered</p>
                </div>
                <button className={btnBlackSolid} onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {employees.map((emp, idx) => (
                  <motion.div key={emp.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <Card className="bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden pt-2">
                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => setDeleteEmpConfirm({ open: true, id: emp.id, name: emp.name })} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <CardHeader className="pb-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl mb-3">{emp.name?.charAt(0) || '?'}</div>
                          <CardTitle className="text-base font-bold text-slate-900">{emp.name}</CardTitle>
                          <CardDescription className="text-xs text-slate-400 truncate mt-1">{emp.email}</CardDescription>
                       </CardHeader>
                       <CardContent>
                          <button className={`${btnBlackOutline} w-full`} onClick={() => navigate(`/profile?id=${emp.id}&name=${encodeURIComponent(emp.name)}`)}>
                             <User className="w-3.5 h-3.5" /> View Profile
                          </button>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Review Dialog ── */}
      <Dialog open={isActionDialogOpen} onOpenChange={(o) => { if(!o) setIsActionDialogOpen(false); }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white" showCloseButton={false}>
           <div className="bg-black px-6 py-5 flex items-center justify-between border-none">
              <h2 className="text-white text-lg font-bold tracking-tight">Review Application</h2>
              <button 
                onClick={() => setIsActionDialogOpen(false)} 
                className="text-white/70 hover:text-white transition-colors ml-4 flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
           </div>
           
           {selectedLeave && (
             <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col justify-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Employee</p>
                      <p className="font-bold text-black text-sm truncate">{selectedLeave.employee_name || 'Generic Employee'}</p>
                   </div>
                   <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col justify-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Leave Type</p>
                      <p className="font-bold text-black text-sm capitalize">{selectedLeave.leave_type}</p>
                   </div>
                   <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col justify-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Duration</p>
                      <p className="font-bold text-black text-sm">{selectedLeave.days} Work Days</p>
                   </div>
                   <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col justify-center">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Interval</p>
                      <p className="font-bold text-black text-[11px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                        {format(new Date(selectedLeave.start_date), 'MMM d')} - {format(new Date(selectedLeave.end_date), 'MMM d, yyyy')}
                      </p>
                   </div>
                </div>
                
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Applicant's Reason</p>
                   <p className="text-zinc-700 text-sm leading-relaxed min-h-[40px]">
                     {selectedLeave.reason || 'No reason specified.'}
                   </p>
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-bold text-zinc-800">Internal Comment</label>
                   <textarea 
                     rows={2} 
                     className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:ring-2 focus:ring-black focus:outline-none resize-none transition-all placeholder:text-zinc-300" 
                     placeholder="Enter feedback for the employee..." 
                     value={managerComment} 
                     onChange={e => setManagerComment(e.target.value)} 
                   />
                </div>
                
                <div className="flex gap-3 pt-2">
                   <button className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg text-sm hover:bg-red-600 transition-colors" onClick={() => setRejectConfirm(true)}>Reject</button>
                   <button className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 transition-colors" onClick={() => setApproveConfirm(true)}>Approve</button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
      
      {/* ── Add Employee Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={o => setIsAddDialogOpen(o)}>
         <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white" showCloseButton={false}>
            <div className="bg-black px-6 py-5 flex items-center justify-between border-none">
               <h2 className="text-white text-lg font-bold tracking-tight">New Employee Profile</h2>
               <button onClick={() => setIsAddDialogOpen(false)} className="text-white/70 hover:text-white transition-colors ml-4 flex-shrink-0" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-white p-6 md:pb-8">
               <form onSubmit={handleAddEmployee} className="space-y-4">
                  {addError && <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg text-xs font-medium flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" />{addError}</div>}
                  {['Name', 'Email', 'Password'].map(l => (
                    <div key={l} className="space-y-1.5">
                       <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{l}</label>
                       <input type={l === 'Password' ? 'password' : l === 'Email' ? 'email' : 'text'} required className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 focus:ring-2 focus:ring-black focus:outline-none transition-all" value={newEmployee[l.toLowerCase()]} onChange={e => setNewEmployee({...newEmployee, [l.toLowerCase()]: e.target.value})} placeholder={`Enter ${l.toLowerCase()}...`} />
                    </div>
                  ))}
                  <button type="submit" disabled={isAdding} className={`${btnBlackSolid} w-full py-3 h-auto mt-2 font-bold`}>
                    {isAdding ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</> : 'Complete Registration'}
                  </button>
               </form>
            </div>
         </DialogContent>
      </Dialog>

    </div>
  );
};

export default ManagerDashboard;
