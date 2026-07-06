'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, User, X } from 'lucide-react';
import { UserPickerOption } from '@/types/coupon';
import { adminDashboardService } from '@/services/adminDashboardService';

interface UserPickerProps {
  selectedUser: UserPickerOption | null;
  onSelect: (user: UserPickerOption | null) => void;
  type: 'partner' | 'creator';
}

export default function UserPicker({ selectedUser, onSelect, type }: UserPickerProps) {
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserPickerOption[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userSearch.length >= 2) {
        setIsSearchingUsers(true);
        try {
          const res = await adminDashboardService.getUsers({ search: userSearch, limit: 10 });
          if (res.success) {
            setSearchResults(res.users.map(u => ({
              id: u.id,
              firstname: u.firstname,
              lastname: u.lastname,
              email: u.email,
              role: u.role
            })));
          }
        } catch (err) {
          console.error('User search failed:', err);
        } finally {
          setIsSearchingUsers(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleSelect = (user: UserPickerOption) => {
    onSelect(user);
    setSearchResults([]);
    setUserSearch('');
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-[2rem] space-y-4">
      <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest mb-2 flex items-center gap-2">
        <User size={14} className="text-blue-400" /> {type === 'partner' ? 'Partner Wallet' : 'Target User Selection'}
      </h3>
      
      <div className="relative">
        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">
          {type === 'partner' ? 'Target Partner Wallet' : `Search ${type === 'creator' ? 'Creator' : 'User'}`}
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text"
            value={selectedUser ? `${selectedUser.firstname} ${selectedUser.lastname}` : userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              if (selectedUser) onSelect(null);
            }}
            placeholder="Name or email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-10 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
          {isSearchingUsers && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <RefreshCw size={14} className="animate-spin text-zinc-500" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && !selectedUser && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-zinc-800/50"
            >
              {searchResults.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    {user.firstname[0]}{user.lastname[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-200">{user.firstname} {user.lastname}</p>
                    <p className="text-[10px] text-zinc-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {selectedUser && (
          <div className="mt-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center">
                <User size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400">Target Selected</p>
                <p className="text-[10px] text-zinc-200">{selectedUser.firstname} {selectedUser.lastname}</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => onSelect(null)}
              className="text-zinc-500 hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
