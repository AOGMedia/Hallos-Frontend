import Link from 'next/link';
import { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background-darker">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="rotate-180">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            {title}
          </h1>
          <p className="text-text-muted text-sm">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="space-y-8 text-text-primary/90 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      <div className="space-y-3 text-text-primary/80">
        {children}
      </div>
    </section>
  );
}
