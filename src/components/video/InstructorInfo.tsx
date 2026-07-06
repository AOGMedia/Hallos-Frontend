'use client';

import { memo } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import type { InstructorInfoProps } from '@/types/video';

function InstructorInfoComponent({ name, avatar, bio }: InstructorInfoProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary mb-2.5">{name}</p>
        {bio && (
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-text-primary leading-4">
              Class Brief
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {bio}
            </p>
          </div>
        )}
      </div>
      <Avatar src={avatar} alt={name} size="md" className="flex-shrink-0" />
    </div>
  );
}

export const InstructorInfo = memo(InstructorInfoComponent);
InstructorInfo.displayName = 'InstructorInfo';