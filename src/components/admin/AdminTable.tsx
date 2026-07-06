import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowKey: keyof T | ((item: T) => string);
}

export default function AdminTable<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data found.',
  onRowClick,
  rowKey,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="animate-pulse text-sm font-medium">Loading data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-zinc-500 border-t border-zinc-800/50">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const getRowKey = (item: T): string => {
    if (typeof rowKey === 'function') return rowKey(item);
    return String(item[rowKey]);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`p-4 font-semibold ${col.className || ''} ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-zinc-300 text-sm">
          {data.map((item) => (
            <tr 
              key={getRowKey(item)} 
              onClick={() => onRowClick?.(item)}
              className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  className={`p-4 ${col.className || ''} ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {typeof col.accessor === 'function' 
                    ? col.accessor(item) 
                    : String(item[col.accessor] ?? '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
