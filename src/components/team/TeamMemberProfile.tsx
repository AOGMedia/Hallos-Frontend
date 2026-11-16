import Image from 'next/image';
import { Globe, Mail, MapPin } from 'lucide-react';
import type { TeamMember } from './types';

interface TeamMemberProfileProps {
  member: TeamMember;
  /** First profile on the page: its photo loads first. */
  priority?: boolean;
}

/** The bio as paragraphs (blank lines in the data separate them). */
const toParagraphs = (bio: string) =>
  bio
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

/**
 * A team member's full profile, shown on the page (what the card's
 * "View details" popup used to show). Stacked on phones; photo and contact
 * details beside the bio on wider screens.
 */
export function TeamMemberProfile({ member, priority = false }: TeamMemberProfileProps) {
  return (
    <article
      aria-labelledby={`${member.id}-name`}
      className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-3xl border border-border/20 bg-background-card"
    >
      <div className="flex flex-col md:flex-row">
        {/* Photo and contact details */}
        <aside className="flex flex-col gap-5 p-5 sm:p-6 md:w-[320px] md:shrink-0 md:border-r md:border-border/20">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl bg-primary/10">
            <Image
              src={member.image}
              alt={member.name}
              fill
              priority={priority}
              className="object-cover object-top"
              sizes="(min-width: 768px) 280px, (min-width: 360px) 280px, 90vw"
            />
          </div>

          <ul className="flex flex-col gap-2 text-sm text-text-muted">
            {member.location && (
              <li className="flex items-center gap-2.5">
                <MapPin size={15} className="shrink-0" aria-hidden="true" />
                <span>{member.location}</span>
              </li>
            )}
            {member.websiteUrl && (
              <li className="flex min-w-0 items-center gap-2.5">
                <Globe size={15} className="shrink-0" aria-hidden="true" />
                <a
                  href={member.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-primary underline-offset-4 hover:underline"
                >
                  {member.website}
                </a>
              </li>
            )}
            {member.emailAddress && (
              <li className="flex min-w-0 items-center gap-2.5">
                <Mail size={15} className="shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${member.emailAddress}`}
                  className="truncate text-primary underline-offset-4 hover:underline"
                >
                  {member.emailAddress}
                </a>
              </li>
            )}
            {member.linkedinUrl && (
              <li>
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  className="inline-flex items-center gap-2.5 text-primary underline-offset-4 hover:underline"
                >
                  <Image src="/icons/linkedin.svg" alt="" width={16} height={16} aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        </aside>

        {/* Role, name and bio */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 pt-0 sm:p-6 md:pt-6">
          <div className="flex flex-col gap-2.5">
            <span className="self-start rounded border border-primary px-2 py-0.5 text-xs font-medium text-primary">
              {member.role}
            </span>
            <h2 id={`${member.id}-name`} className="text-2xl font-bold leading-8 text-text-primary">
              {member.name}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-text-muted">Bio</span>
            {toParagraphs(member.fullBio).map((paragraph, i) => (
              <p key={i} className="text-base leading-7 text-text-primary/90">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
