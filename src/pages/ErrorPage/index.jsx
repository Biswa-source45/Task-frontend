import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ type = '404' }) => {
  const navigate = useNavigate();

  const isDBError = type === 'db';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 bg-black rounded-full shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-black text-black mb-4 tracking-tighter"
        >
          {isDBError ? 'OFFLINE' : '404'}
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-zinc-500 text-lg mb-8 font-medium leading-relaxed"
        >
          {isDBError 
            ? "We're having trouble connecting to our database. Our team is looking into it." 
            : "Oops! The page you're looking for doesn't exist or has been moved."}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-900 transition-all active:scale-95 shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 bg-white text-black border-2 border-zinc-100 py-4 rounded-xl font-bold hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
        
        <p className="mt-12 text-zinc-300 text-xs font-bold uppercase tracking-widest">
          Leave Management System
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
