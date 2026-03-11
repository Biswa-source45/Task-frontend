import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { login } from '../../api/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lock, Mail, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      loginUser(data.user, data.access_token);
      // navigation handled by useEffect above or explicitly here for immediate feedback
      if (data.user.role === 'manager') {
        navigate('/manager-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] relative overflow-hidden px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-100 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm z-10"
      >
        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-white/50 bg-white/90 backdrop-blur-2xl rounded-[2rem] overflow-hidden border">
          <CardHeader className="space-y-2 px-8 pt-8 pb-2 text-center">
            <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xl shadow-slate-900/10"
            >
              <Lock className="w-6 h-6 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Portal Entry</CardTitle>
            <CardDescription className="text-slate-400 font-medium text-xs px-2">
              Securely enter your credentials to access the management dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2">
            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-[12px] font-bold flex items-center gap-2.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pl-1" htmlFor="email">
                  Registration Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-11 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 focus-visible:border-slate-900 transition-all font-medium text-slate-900 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400" htmlFor="password">
                    Secure Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-11 pr-11 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-0 focus-visible:border-slate-900 transition-all font-medium text-slate-900 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl shadow-xl shadow-slate-900/10 font-bold text-sm transition-all active:scale-[0.98] group" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Access Dashboard</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-[10px] text-slate-300 font-medium tracking-widest uppercase">
              • Authorized Access •
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
