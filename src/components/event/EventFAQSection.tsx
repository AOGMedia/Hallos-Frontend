'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I register for the event?',
    answer:
      'Click any "Register" button on this page and complete the registration form. A ₦3,000 non-refundable commitment fee is required to secure your spot.',
  },
  {
    id: 'faq-2',
    question: 'Is the event fully covered?',
    answer:
      'Yes — once you are shortlisted among the participants, all expenses for the 2-day event including accommodation and meals are fully covered.',
  },
  {
    id: 'faq-3',
    question: 'What happens after I register?',
    answer:
      'After registering, you will receive a confirmation email with further instructions.',
  },
  {
    id: 'faq-4',
    question: 'Can I transfer my slot to someone else?',
    answer:
      'No. Participation in the program is non-transferable. Shortlisted slots cannot be transferred to another individual.',
  },
];

export function EventFAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      aria-label="Frequently asked questions"
      className="event-section-dark w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16"
    >
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[60px]">
        {/* Heading */}
        <h2
          className="text-center"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: '80px',
            color: '#f2f2f2',
          }}
        >
          FAQs
        </h2>

        {/* Accordion container */}
        <div className="event-faq-container p-4 sm:p-6 flex flex-col gap-1">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                {/* Open item gets a rounded container */}
                {isOpen ? (
                  <div
                    className="rounded-[10px] px-4 py-4"
                    style={{ background: 'rgba(250,250,250,0.04)' }}
                  >
                    {/* Question row */}
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center justify-between gap-4 cursor-pointer"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <span
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 'clamp(16px, 1.5vw, 24px)',
                          fontWeight: 700,
                          color: '#f2f2f2',
                          textAlign: 'left',
                        }}
                      >
                        {item.question}
                      </span>
                      <ChevronUp
                        size={17}
                        className="flex-shrink-0"
                        style={{ color: '#f2f2f2' }}
                        aria-hidden="true"
                      />
                    </button>
                    {/* Answer */}
                    <div
                      id={`faq-answer-${item.id}`}
                      className="mt-3"
                    >
                      <p
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '24px',
                          color: 'rgba(242,242,242,0.8)',
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors rounded-[10px]"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: 'clamp(16px, 1.5vw, 24px)',
                        fontWeight: 700,
                        color: '#f2f2f2',
                        textAlign: 'left',
                      }}
                    >
                      {item.question}
                    </span>
                    <ChevronDown
                      size={17}
                      className="flex-shrink-0"
                      style={{ color: '#f2f2f2' }}
                      aria-hidden="true"
                    />
                  </button>
                )}

                {/* Divider (not after last item) */}
                {idx < FAQ_ITEMS.length - 1 && !isOpen && (
                  <div
                    className="mx-4"
                    style={{ borderTop: '1px solid rgba(234,234,234,0.1)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
