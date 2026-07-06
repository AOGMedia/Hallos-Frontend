import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Users, Link as LinkIcon, Plus, Edit2, ArrowLeft, Copy } from 'lucide-react';
import { 
  usePartnerCodes, 
  usePartnerCodeCreators, 
  usePartnerCommissions,
  useCreatePartnerCode,
  useUpdatePartnerCode
} from '@/hooks/useAdminPartnerReferrals';
import Pagination from './Pagination';
import UserPicker from './coupon/UserPicker';
import type { PartnerReferralCode } from '@/lib/api/partnerReferral';
import type { UserPickerOption } from '@/types/coupon';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';

type Tab = 'codes' | 'creators' | 'commissions';

interface AdminPartnerReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPartnerReferralModal({ isOpen, onClose }: AdminPartnerReferralModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('codes');
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-sm"
           onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#121212] rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-[#1a1a1a] rounded-t-2xl">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <LinkIcon className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-zinc-100">Partner Program</h2>
              </div>
              
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(['codes', 'creators', 'commissions'] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                       setActiveTab(tab);
                       if (tab !== 'creators') setSelectedCodeId(null);
                    }}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                      activeTab === tab 
                        ? 'bg-zinc-800 text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#121212] relative scrollbar-hide">
             {activeTab === 'codes' && <CodesTab onSelectCode={(id) => { setSelectedCodeId(id); setActiveTab('creators'); }} />}
             {activeTab === 'creators' && <CreatorsTab codeId={selectedCodeId} onBack={() => { setActiveTab('codes'); setSelectedCodeId(null); }} />}
             {activeTab === 'commissions' && <CommissionsTab />}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ----------------------------------------------------------------------------
// CODES TAB
// ----------------------------------------------------------------------------
function CodesTab({ onSelectCode }: { onSelectCode: (id: string) => void }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCode, setEditCode] = useState<PartnerReferralCode | null>(null);

  const { data, isLoading, isFetching, refetch } = usePartnerCodes({ page, limit: 10, status });
  const codes = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / 10) : 1;
  const showToast = useAdminDashboardStore(state => state.showToast);

  const handleCopyLink = (code: string) => {
    const link = `https://www.hallos.net/signup?ref=${code}`;
    navigator.clipboard.writeText(link);
    showToast('Invite link copied to clipboard!', 'success');
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <select 
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            <button onClick={() => refetch()} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 transition-colors">
               <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <button 
             onClick={() => { 
               setEditCode(null); 
               setIsFormOpen(true);
               setTimeout(() => document.getElementById('partner-code-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
             }}
             className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors"
          >
             <Plus size={16} /> Create Partner Code
          </button>
       </div>

       {isFormOpen && (
          <div id="partner-code-form" className="mb-6 p-5 border border-purple-900/40 bg-purple-900/10 rounded-xl">
             <CodeForm 
               key={editCode ? editCode.id : 'new-code-form'}
               code={editCode} 
               onClose={() => { setIsFormOpen(false); setEditCode(null); }} 
             />
          </div>
       )}

       <div className="flex-1">
         {isLoading && codes.length === 0 ? (
           <div className="text-center text-zinc-500 py-10 animate-pulse">Loading codes...</div>
         ) : codes.length === 0 ? (
           <div className="text-center text-zinc-500 py-10">No partner codes found.</div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {codes.map(code => (
                 <div key={code.id} className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors flex flex-col justify-between">
                    <div>
                       <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                               code.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                               code.status === 'inactive' ? 'bg-amber-500/10 text-amber-500' :
                               'bg-zinc-800 text-zinc-500'
                            }`}>
                               {code.status}
                            </span>
                            <h3 className="text-lg font-bold text-zinc-100 mt-2">{code.label}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-xs text-zinc-500 font-mono">Code: {code.referralCode}</p>
                               <button 
                                  onClick={() => handleCopyLink(code.referralCode)}
                                  className="text-zinc-500 hover:text-purple-400 transition-colors"
                                  title="Copy Invite Link"
                               >
                                  <Copy size={14} />
                               </button>
                            </div>
                          </div>
                          <button 
                             onClick={() => { 
                               setEditCode(code); 
                               setIsFormOpen(true);
                               setTimeout(() => document.getElementById('partner-code-form')?.scrollIntoView({ behavior: 'smooth' }), 50);
                             }}
                             className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                             <Edit2 size={16} />
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-800/50">
                             <p className="text-[10px] text-zinc-500 uppercase font-semibold">Comm. %</p>
                             <p className="text-sm font-bold text-zinc-200">{code.commissionPercent}%</p>
                          </div>
                          <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-800/50">
                             <p className="text-[10px] text-zinc-500 uppercase font-semibold">Partner ID</p>
                             <p className="text-sm font-bold text-zinc-200">#{code.partnerUserId}</p>
                          </div>
                          <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-800/50">
                             <p className="text-[10px] text-zinc-500 uppercase font-semibold">Referrals</p>
                             <p className="text-sm font-bold text-zinc-200">{code.totalLinkedCreators ?? 0}</p>
                          </div>
                          <div className="bg-black/30 p-2.5 rounded-lg border border-zinc-800/50">
                             <p className="text-[10px] text-zinc-500 uppercase font-semibold">Earnings</p>
                             <p className="text-sm font-bold text-emerald-400">₦{Number(code.totalCommissionsPaid || 0).toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                    
                    <button 
                       onClick={() => onSelectCode(code.id)}
                       className="mt-4 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                       <Users size={14} /> View Creators
                    </button>
                 </div>
              ))}
           </div>
         )}
       </div>

       <div className="mt-4 -mx-6 -mb-6">
         <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={isFetching} />
       </div>
    </div>
  );
}

function CodeForm({ code, onClose }: { code: PartnerReferralCode | null, onClose: () => void }) {
  const [label, setLabel] = useState(code?.label || '');
  const [selectedPartner, setSelectedPartner] = useState<UserPickerOption | null>(
     code ? { id: code.partnerUserId, firstname: 'Existing', lastname: 'Partner', email: `ID: ${code.partnerUserId}`, role: 'partner' } : null
  );
  const [commissionPercent, setCommissionPercent] = useState(code?.commissionPercent?.toString() || '');
  const [status, setStatus] = useState<PartnerReferralCode['status']>(code?.status || 'active');
  
  // Basic HTML date string format YYYY-MM-DD
  const expiryDateMatch = code?.expiresAt ? new Date(code.expiresAt).toISOString().split('T')[0] : '';
  const [expiresAt, setExpiresAt] = useState(expiryDateMatch);

  const createMut = useCreatePartnerCode();
  const updateMut = useUpdatePartnerCode();
  const isPending = createMut.isPending || updateMut.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (code) {
       await updateMut.mutateAsync({
         id: code.id,
         payload: {
           label,
           commissionPercent: Number(commissionPercent),
           status,
           expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
         }
       });
     } else {
       await createMut.mutateAsync({
         partnerUserId: selectedPartner!.id,
         label,
         commissionPercent: Number(commissionPercent),
         expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined
       });
     }
     onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
       <div className="flex items-center justify-between border-b border-purple-900/30 pb-3 mb-1">
          <h3 className="text-sm font-bold text-purple-100">{code ? 'Edit Partner Code' : 'Create New Partner Code'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white"><X size={16} /></button>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {!code && (
           <div className="sm:col-span-2 lg:col-span-3 mb-2">
             <UserPicker 
               type="partner" 
               selectedUser={selectedPartner}
               onSelect={setSelectedPartner}
             />
           </div>
         )}
         <div className="flex flex-col gap-1.5">
           <label className="text-[10px] uppercase font-bold text-zinc-400">Label</label>
           <input required value={label} onChange={e=>setLabel(e.target.value)} className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500" placeholder="e.g. NTA Q3 Promo" />
         </div>
         <div className="flex flex-col gap-1.5">
           <label className="text-[10px] uppercase font-bold text-zinc-400">Commission %</label>
           <input required value={commissionPercent} onChange={e=>setCommissionPercent(e.target.value)} type="number" step="0.01" min="0.01" max="99.99" className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500" placeholder="10.5" />
         </div>
         <div className="flex flex-col gap-1.5">
           <label className="text-[10px] uppercase font-bold text-zinc-400">Expires At (Optional)</label>
           <input value={expiresAt} onChange={e=>setExpiresAt(e.target.value)} type="date" className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500" />
         </div>
         {code && (
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] uppercase font-bold text-zinc-400">Status</label>
             <select value={status} onChange={e=>setStatus(e.target.value as PartnerReferralCode['status'])} className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500">
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
               <option value="expired">Expired</option>
             </select>
           </div>
         )}
       </div>
       <div className="flex justify-end pt-4 border-t border-purple-900/30 mt-2">
         <button type="submit" disabled={isPending || (!selectedPartner && !code)} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
           {isPending ? 'Saving...' : 'Save Code'}
         </button>
       </div>
    </form>
  )
}

// ----------------------------------------------------------------------------
// CREATORS TAB
// ----------------------------------------------------------------------------
function CreatorsTab({ codeId, onBack }: { codeId: string | null, onBack: () => void }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePartnerCodeCreators({ id: codeId, page, limit: 10 });
  const creators = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / 10) : 1;

  if (!codeId) {
     return <div className="p-10 text-center text-zinc-500">Please select a Partner Code from the Codes tab to view its linked creators.</div>
  }

  return (
    <div className="p-6 h-full flex flex-col">
       <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 font-semibold w-fit">
          <ArrowLeft size={16} /> Back to Codes
       </button>
       
       <div className="flex-1">
         {isLoading && creators.length === 0 ? (
           <div className="text-center text-zinc-500 py-10 animate-pulse">Loading creators...</div>
         ) : creators.length === 0 ? (
           <div className="text-center text-zinc-500 py-10">No creators have signed up with this code yet.</div>
         ) : (
           <div className="space-y-3">
              {creators.map(creator => (
                 <div key={creator.creatorUserId} className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-900/30">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-500/20">
                          {creator.firstname[0]?.toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-zinc-100">{creator.firstname} {creator.lastname}</p>
                          <p className="text-xs text-zinc-500">{creator.email}</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${creator.commissionActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {creator.commissionActive ? 'Commission Active' : 'Inactive'}
                       </span>
                       <span className="text-[10px] text-zinc-500">Joined: {new Date(creator.signedUpAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              ))}
           </div>
         )}
       </div>

       <div className="mt-4 -mx-6 -mb-6">
         <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={isFetching} />
       </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// COMMISSIONS TAB (Ledger)
// ----------------------------------------------------------------------------
function CommissionsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = usePartnerCommissions({ page, limit: 15 });
  const commissions = data?.data || [];
  const totalPages = data ? Math.ceil(data.total / 15) : 1;

  return (
    <div className="p-6 h-full flex flex-col">
       <div className="flex items-center justify-between mb-4">
         <h3 className="text-sm font-bold text-zinc-300">Global Partner Commission Ledger</h3>
       </div>

       <div className="flex-1 overflow-x-auto">
         {isLoading && commissions.length === 0 ? (
           <div className="text-center text-zinc-500 py-10 animate-pulse">Loading ledger...</div>
         ) : commissions.length === 0 ? (
           <div className="text-center text-zinc-500 py-10">No commission records found.</div>
         ) : (
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-zinc-800 text-xs uppercase font-bold text-zinc-500 tracking-wider">
                 <th className="pb-3 pr-4 font-medium">Date</th>
                 <th className="pb-3 px-4 font-medium">Code</th>
                 <th className="pb-3 px-4 font-medium">Partner ID</th>
                 <th className="pb-3 px-4 font-medium">Creator ID</th>
                 <th className="pb-3 px-4 font-medium">Content</th>
                 <th className="pb-3 pl-4 font-medium text-right">Commission</th>
               </tr>
             </thead>
             <tbody className="text-sm text-zinc-300">
               {commissions.map((item) => (
                 <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                   <td className="py-4 pr-4 whitespace-nowrap text-zinc-400 text-xs">
                     {new Date(item.createdAt).toLocaleDateString()}
                   </td>
                   <td className="py-4 px-4 font-mono text-zinc-400 text-xs">
                     {item.referralCode}
                   </td>
                   <td className="py-4 px-4">
                     #{item.referrerUserId}
                   </td>
                   <td className="py-4 px-4">
                     #{item.refereeUserId}
                   </td>
                   <td className="py-4 px-4 text-xs">
                     <span className="capitalize">{item.contentType.replace('_', ' ')}</span>
                     <br/>
                     <span className="text-zinc-600 truncate max-w-[120px] inline-block mt-0.5">{item.contentId}</span>
                   </td>
                   <td className="py-4 pl-4 text-right whitespace-nowrap">
                     <span className="font-bold text-emerald-400">
                       {item.currency} {Number(item.commissionAmount).toLocaleString()}
                     </span>
                     <br/>
                     <span className="text-[10px] text-zinc-500">{item.commissionPercent}% of purchase</span>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
       </div>

       <div className="-mx-6 -mb-6 border-t border-zinc-800">
         <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} isLoading={isFetching} />
       </div>
    </div>
  )
}
