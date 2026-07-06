import Link from 'next/link';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  showViewAll?: boolean;
  viewAllHref?: string;
}

export function SectionHeader({
  title,
  icon,
  showViewAll = false,
  viewAllHref = '#',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon && <div className="w-5 h-4">{icon}</div>}
        <h2 className="heading-small">{title}</h2>
      </div>
      {showViewAll && (
        <Link
          href={viewAllHref}
          className="flex items-center gap-2 text-heading-small hover:opacity-80 transition-opacity"
        >
          <span>View all</span>
          <ArrowRightIcon className="w-2 h-4 text-[#888c94]" />
        </Link>
      )}
    </div>
  );
}