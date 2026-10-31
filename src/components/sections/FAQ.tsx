'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import ChevronUpIcon from '@/components/icons/ChevronUpIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import { HOME_FAQS } from '@/data/faqs';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-12">FAQs</h2>

        <Card variant="glass" className="max-w-5xl mx-auto p-4 sm:p-6">
          {HOME_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const panelId = `faq-panel-${index}`;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="w-full flex justify-between items-start gap-4 py-4 text-left hover:opacity-80 transition-opacity"
                >
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold flex-1">{faq.question}</h3>
                  <div className="flex-shrink-0 mt-1">
                    {isOpen ? (
                      <span className='bg-[#FFFFFF1A] p-2 flex rounded-full items-center text-center'>

                      <ChevronUpIcon width={10} height={10} color="#F2F2F2" />
                      </span>
                    ) : (
                      <ChevronDownIcon width={17} height={9} color="#F2F2F2" />
                    )}
                  </div>
                </button>

                {/* Every answer stays in the HTML (collapsed ones are just hidden)
                    so search engines can read all of them. */}
                <div id={panelId} hidden={!isOpen} className="pb-4 pr-4 sm:pr-8">
                  <p className="text-body text-sm sm:text-base">{faq.answer}</p>
                </div>

                {index < HOME_FAQS.length - 1 && (
                  <div className="border-b border-border" />
                )}
              </div>
            );
          })}
        </Card>
      </div>
    </section>
  );
}
