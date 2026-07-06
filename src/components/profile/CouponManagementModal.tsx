'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  X, Plus, Trash2, Calendar, Tag, AlertCircle,
  CheckCircle2, Ticket, ChevronDown, Search, Loader2, Video, Radio, RefreshCw, Edit2, BarChart2
} from 'lucide-react';
import { useCouponStore } from '@/store/couponStore';
import { CouponCreatePayload, CouponUpdatePayload, ContentType, Coupon } from '@/types/coupon';
import { couponService } from '@/services/couponService';
import { getMyVideos } from '@/lib/api/videos';
import { getMyLiveClasses } from '@/lib/api/live';
import { getMySeries } from '@/services/seriesService';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ContentOption {
  value: string;
  label: string;
  type: ContentType;
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: 'Videos',
  live_class: 'Live Classes',
  live_series: 'Live Series',
};

const CONTENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  video: <Video size={13} />,
  live_class: <Radio size={13} />,
  live_series: <RefreshCw size={13} />,
};

export function CouponManagementModal({ isOpen, onClose }: Props) {
  const { coupons, isLoading, fetchCoupons, deleteCoupon } = useCouponStore();
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'stats'>('list');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<Record<string, unknown> | null>(null);
  const [isFetchingStats, setIsFetchingStats] = useState(false);

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentOption[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [allContent, setAllContent] = useState<ContentOption[]>([]);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) fetchCoupons();
  }, [isOpen, fetchCoupons]);

  useEffect(() => {
    setIsFetchingContent(true);
    Promise.all([
      getMyVideos().catch(() => []),
      getMyLiveClasses().catch(() => ({ liveClasses: [] })),
      getMySeries().catch(() => []),
    ]).then(([videos, liveRes, series]) => {
      const videoOpts: ContentOption[] = videos.map(v => ({ value: v.id, label: v.title, type: 'video' as ContentType }));
      const classOpts: ContentOption[] = (liveRes.liveClasses || []).map(c => ({ value: c.id, label: c.title || 'Untitled', type: 'live_class' as ContentType }));
      const seriesOpts: ContentOption[] = series.map(s => ({ value: s.id, label: s.title, type: 'live_series' as ContentType }));
      setAllContent([...videoOpts, ...classOpts, ...seriesOpts]);
    }).finally(() => setIsFetchingContent(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteCoupon(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const resetForm = () => {
    setCode(''); setDiscountType('percentage'); setDiscountValue('');
    setUsageLimit(''); setExpiresAt(''); setStartsAt('');
    setStatus('active'); setContentTypes([]);
    setSelectedContent([]); setFormError(null); setSearch('');
    setEditingCouponId(null);
  };

  const handleEditMode = (coupon: Coupon) => {
    setCode(coupon.code);
    setDiscountType(coupon.discountType || 'percentage');
    setDiscountValue(coupon.discountType === 'flat' ? (coupon.discountValue / 100) : (coupon.discountValue || ''));
    setUsageLimit(coupon.usageLimit || '');
    setStartsAt(coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '');
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '');
    setStatus(coupon.status === 'inactive' ? 'inactive' : 'active');
    setContentTypes(coupon.applicableContentTypes || []);
    const specIds = coupon.specificContentIds || [];
    setSelectedContent(allContent.filter(c => specIds.includes(c.value)));
    setEditingCouponId(coupon.id);
    setView('edit');
  };

  const handleViewStats = async (id: string, codeStr: string) => {
    setView('stats');
    setIsFetchingStats(true);
    try {
       const res = await couponService.getCouponUsage(id);
       if (res.success && res.data) {
          setStatsData({ ...res.data, code: codeStr });
       }
    } catch (err) {
       console.error(err);
    } finally {
       setIsFetchingStats(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!code.trim() || !discountValue || contentTypes.length === 0) {
      setFormError('Please fill in all required fields: Code, Discount Value, and at least one Content Type.');
      return;
    }
    setIsCreating(true);
    try {
      const val = Number(discountValue);
      const payload: CouponUpdatePayload & { code?: string; specificContentIds?: string[] | null } = {
        discountType,
        discountValue: discountType === 'flat' ? val * 100 : val,
        applicableContentTypes: contentTypes,
        specificContentIds: selectedContent.length > 0 ? selectedContent.map(c => c.value) : null,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        status,
      };
      
      let res;
      if (view === 'edit' && editingCouponId) {
        payload.status = 'active'; // implicitly keep active on edit
        res = await couponService.updateCoupon(editingCouponId, payload);
      } else {
        payload.code = code.trim();
        res = await couponService.createCoupon(payload as CouponCreatePayload);
      }

      if (res.success) {
        resetForm();
        setView('list');
        fetchCoupons();
      } else {
        setFormError(res.message || 'Failed to save coupon.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setFormError(e.message || 'An error occurred.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleContentType = (type: ContentType) => {
    const next = contentTypes.includes(type)
      ? contentTypes.filter(t => t !== type)
      : [...contentTypes, type];
    setContentTypes(next);
    if (!next.includes(type)) {
      setSelectedContent(prev => prev.filter(c => c.type !== type));
    }
  };

  const toggleSelectedContent = (option: ContentOption) => {
    setSelectedContent(prev =>
      prev.find(c => c.value === option.value)
        ? prev.filter(c => c.value !== option.value)
        : [...prev, option]
    );
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesType = filterType === 'all' || c.applicableContentTypes.includes(filterType as ContentType);
    return matchesStatus && matchesType;
  });

  const filteredOptions = allContent.filter(c => {
    const matchesType = contentTypes.length === 0 || contentTypes.includes(c.type);
    const matchesSearch = !search || c.label.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const grouped = filteredOptions.reduce<Record<string, ContentOption[]>>((acc, opt) => {
    if (!acc[opt.type]) acc[opt.type] = [];
    acc[opt.type].push(opt);
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-background-darker rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Ticket size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Coupon Management</h2>
                <p className="text-xs text-text-muted">Create and track your promotional codes</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">

            {/* LIST VIEW */}
            {view === 'list' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap items-center gap-3">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-text-muted outline-none focus:border-primary">
                      <option value="all" className="bg-background-darker">All Status</option>
                      <option value="active" className="bg-background-darker">Active</option>
                      <option value="inactive" className="bg-background-darker">Inactive</option>
                      <option value="expired" className="bg-background-darker">Expired</option>
                    </select>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-text-muted outline-none focus:border-primary">
                      <option value="all" className="bg-background-darker">All Types</option>
                      <option value="video" className="bg-background-darker">Videos</option>
                      <option value="live_class" className="bg-background-darker">Live Classes</option>
                      <option value="live_series" className="bg-background-darker">Live Series</option>
                    </select>
                    <button onClick={() => setView('create')} className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 text-sm">
                      <Plus size={14} /> New Coupon
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                ) : filteredCoupons.length === 0 ? (
                  <div className="py-14 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
                    <Tag size={40} className="text-white/10" />
                    <p className="text-text-muted text-sm">{coupons.length === 0 ? 'No coupons yet.' : 'No coupons match these filters.'}</p>
                    {coupons.length === 0 && <button onClick={() => setView('create')} className="text-primary hover:underline text-sm font-medium">Create your first coupon</button>}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/5 overflow-hidden">
                    {/* Mobile cards */}
                    <div className="sm:hidden divide-y divide-white/5">
                      {filteredCoupons.map(coupon => (
                        <div key={coupon.id} className="p-4 flex items-center justify-between gap-3">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-mono font-bold text-white text-sm bg-white/5 px-2 py-0.5 rounded w-fit">{coupon.code}</span>
                            <span className="text-xs text-gray-400">
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₦${(coupon.discountValue / 100).toLocaleString()}`}
                              {' · '}{coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} uses
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : coupon.status === 'expired' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>{coupon.status}</span>
                            <button onClick={() => handleViewStats(coupon.id, coupon.code)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors">
                              <BarChart2 size={13} />
                            </button>
                            <button onClick={() => handleEditMode(coupon)} className="text-gray-400 hover:text-gray-300 hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: coupon.id, code: coupon.code })} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table */}
                    <table className="w-full text-left border-collapse hidden sm:table">
                      <thead>
                        <tr className="border-b border-white/5 text-xs font-medium text-text-muted">
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Discount</th>
                          <th className="px-4 py-3">Usage</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCoupons.map(coupon => (
                          <tr key={coupon.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3"><span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded text-sm">{coupon.code}</span></td>
                            <td className="px-4 py-3 text-sm text-gray-300">{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₦${(coupon.discountValue / 100).toLocaleString()}`}</td>
                            <td className="px-4 py-3 text-sm text-gray-300">{coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : coupon.status === 'expired' ? 'bg-red-500/10 text-red-400' : 'bg-gray-500/10 text-gray-400'}`}>
                                {coupon.status === 'active' && <CheckCircle2 size={11} />}{coupon.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button onClick={() => handleViewStats(coupon.id, coupon.code)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors mr-1">
                                <BarChart2 size={14} />
                              </button>
                              <button onClick={() => handleEditMode(coupon)} className="text-gray-400 hover:text-gray-300 hover:bg-white/10 p-1.5 rounded-lg transition-colors mr-1">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteTarget({ id: coupon.id, code: coupon.code })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CREATE / EDIT VIEW */}
            {(view === 'create' || view === 'edit') && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <button type="button" onClick={() => { resetForm(); setView('list'); }} className="text-text-muted hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                  <h3 className="text-base font-bold text-white">{view === 'create' ? 'Create New Coupon' : `Edit Coupon: ${code}`}</h3>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-red-400 text-sm">{formError}</p>
                  </div>
                )}

                <form onSubmit={handleCreateOrUpdate} className="space-y-5">
                  {/* Code + Discount Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Coupon Code *</label>
                      <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER25"
                        disabled={view === 'edit'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono uppercase placeholder:normal-case disabled:opacity-50 disabled:cursor-not-allowed" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Discount Type *</label>
                      <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 gap-1">
                        <button type="button" onClick={() => setDiscountType('percentage')} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${discountType === 'percentage' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Percentage (%)</button>
                        <button type="button" onClick={() => setDiscountType('flat')} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${discountType === 'flat' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>Flat Rate (₦)</button>
                      </div>
                    </div>
                  </div>

                  {/* Value + Usage Limit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">{discountType === 'percentage' ? 'Percentage (1–100) *' : 'Amount (₦) *'}</label>
                      <div className="relative">
                        {discountType === 'flat' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₦</span>}
                        <input type="number" min="1" max={discountType === 'percentage' ? 100 : undefined} value={discountValue}
                          onChange={e => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                          className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 text-white text-sm focus:outline-none focus:border-primary ${discountType === 'flat' ? 'pl-7 pr-4' : 'px-4'}`} required />
                        {discountType === 'percentage' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Usage Limit <span className="text-text-muted/50">(optional)</span></label>
                      <input type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value ? Number(e.target.value) : '')} placeholder="Unlimited"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
                    </div>
                  </div>

                  {/* Date Scheduling */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Starts At <span className="text-text-muted/50">(optional)</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary [color-scheme:dark]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Expires At <span className="text-text-muted/50">(optional)</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle (Edit only) */}
                  {view === 'edit' && (
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">Coupon Status</label>
                      <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 gap-1 w-fit">
                        <button type="button" onClick={() => setStatus('active')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${status === 'active' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>Active</button>
                        <button type="button" onClick={() => setStatus('inactive')} className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${status === 'inactive' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}>Inactive</button>
                      </div>
                    </div>
                  )}

                  {/* Content Types */}
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-2">Apply to Content Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {(['video', 'live_class', 'live_series'] as ContentType[]).map(type => (
                        <button key={type} type="button" onClick={() => toggleContentType(type)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${contentTypes.includes(type) ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                          {CONTENT_TYPE_ICONS[type]}{CONTENT_TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Content Multi-Select */}
                  {contentTypes.length > 0 && (
                    <div ref={dropdownRef}>
                      <label className="block text-xs font-medium text-text-muted mb-1.5">
                        Specific Content <span className="text-text-muted/50">(optional — leave empty to apply to all)</span>
                      </label>
                      {selectedContent.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {selectedContent.map(c => (
                            <span key={c.value} className="flex items-center gap-1 px-2 py-1 bg-primary/15 border border-primary/30 rounded-full text-xs text-primary">
                              {c.label}
                              <button type="button" onClick={() => toggleSelectedContent(c)} className="hover:text-white ml-0.5"><X size={10} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button type="button" onClick={() => setDropdownOpen(o => !o)}
                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:border-white/20 transition-colors">
                        <span>{selectedContent.length > 0 ? `${selectedContent.length} selected` : 'Select specific content...'}</span>
                        <ChevronDown size={15} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {dropdownOpen && (
                        <div className="mt-1 bg-[#1a2030] border border-white/10 rounded-xl shadow-xl overflow-hidden relative z-10">
                          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
                            <Search size={13} className="text-gray-400 shrink-0" />
                            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content..."
                              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500" />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {isFetchingContent ? (
                              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                            ) : Object.keys(grouped).length === 0 ? (
                              <p className="text-center text-xs text-gray-500 py-6">No content found</p>
                            ) : (
                              Object.entries(grouped).map(([type, options]) => (
                                <div key={type}>
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] sticky top-0">
                                    <span className="text-primary">{CONTENT_TYPE_ICONS[type]}</span>
                                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{CONTENT_TYPE_LABELS[type]}</span>
                                  </div>
                                  {options.map(opt => {
                                    const isSelected = selectedContent.some(c => c.value === opt.value);
                                    return (
                                      <button key={opt.value} type="button" onClick={() => toggleSelectedContent(opt)}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-white/5 ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                        <span className="truncate text-left">{opt.label}</span>
                                        {isSelected && <CheckCircle2 size={14} className="text-primary shrink-0 ml-2" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => { resetForm(); setView('list'); }}
                      className="px-5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isCreating}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                      {isCreating && <Loader2 size={14} className="animate-spin" />}
                      {isCreating ? 'Saving...' : (view === 'create' ? 'Create Coupon' : 'Save Changes')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STATS VIEW */}
            {view === 'stats' && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <button type="button" onClick={() => setView('list')} className="text-text-muted hover:text-white transition-colors">
                    <X size={16} />
                  </button>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                     <BarChart2 size={16} className="text-blue-400"/>
                     {statsData ? `Usage Stats: ${statsData.code}` : 'Usage Stats'}
                  </h3>
                </div>

                {isFetchingStats ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
                ) : !statsData ? (
                  <div className="py-8 text-center text-text-muted text-sm">Failed to load statistics.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Total Redemptions</p>
                        <p className="text-2xl text-white font-bold">{Number(statsData.totalRedemptions) || Number(statsData.usageCount) || 0}</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Limit</p>
                        <p className="text-2xl text-white font-bold">{statsData.usageLimit ? String(statsData.usageLimit) : '∞'}</p>
                     </div>
                     <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl col-span-2">
                        <p className="text-xs text-green-400/80 mb-1 uppercase tracking-wider font-semibold">Discount Impact</p>
                        <p className="text-2xl text-green-400 font-bold">₦{((Number(statsData.totalDiscounts) || 0) / 100).toLocaleString()}</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-4 rounded-xl col-span-2 sm:col-span-1">
                        <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">Original Value</p>
                        <p className="text-xl text-white font-bold">₦{((Number(statsData.totalOriginalRevenue) || 0) / 100).toLocaleString()}</p>
                     </div>
                     <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl col-span-2 sm:col-span-1">
                        <p className="text-xs text-primary/80 mb-1 uppercase tracking-wider font-semibold">Final Revenue</p>
                        <p className="text-xl text-primary font-bold">₦{((Number(statsData.totalFinalRevenue) || 0) / 100).toLocaleString()}</p>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Coupon?"
        message={`Are you sure you want to delete coupon "${deleteTarget?.code}"? This cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isDestructive
      />
    </>
  );
}
