'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EnrollmentFiltersProps {
  onFilterChange: (filters: { search: string; credentialsSent: string; departmentId: string }) => void;
}

export default function EnrollmentFilters({ onFilterChange }: EnrollmentFiltersProps) {
  const [search, setSearch] = useState('');
  const [credentialsSent, setCredentialsSent] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange({ search, credentialsSent, departmentId });
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, credentialsSent, departmentId, onFilterChange]);

  const clearFilters = () => {
      setSearch('');
      setCredentialsSent('');
      setDepartmentId('');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input
          type="text"
          placeholder="Search by student name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>

      <div className="flex gap-4 w-full md:w-auto">
        <div className="relative">
             <select
                value={credentialsSent}
                onChange={(e) => setCredentialsSent(e.target.value)}
                className="appearance-none bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <option value="">All Statuses</option>
                <option value="true">Sent</option>
                <option value="false">Pending</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
        </div>

        {/* 
        // Department filter - currently mocked as empty list logic if departments prop is empty
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
             <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select> 
        */}
        
        {(search || credentialsSent || departmentId) && (
             <button 
                onClick={clearFilters}
                className="text-zinc-400 hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
             >
                 <X size={18} />
                 Clear
             </button>
        )}
      </div>
    </div>
  );
}
