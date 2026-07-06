'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import ChevronUpIcon from '@/components/icons/ChevronUpIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';

const FAQS = [
  {
    question: 'What is Hallos?',
    answer: 'Watching live interactive sessions has been a blast. It\'s a flexible way of learning, easy to understand and apply. It\'s a fun and effective way to level up my skills. It\'s refreshing to feel like I\'m picking up valuable insights in a fun and engaging way.'
  },
  {
    question: 'Who is Hallos for?',
    answer: 'Hallos is designed for learners, creators, and educators who want to engage in interactive learning experiences. Whether you\'re looking to learn new skills or share your expertise, our platform provides the tools you need.'
  },
  {
    question: 'How do I get started?',
    answer: 'Getting started is easy! Simply create an account, browse our available courses and live sessions, and join the ones that interest you. You can also create your own content and start teaching others.'
  },
  {
    question: 'What features does Hallos offer?',
    answer: 'Hallos offers live interactive sessions, on-demand courses, real-time chat, screen sharing, collaborative tools, and much more. Our platform is designed to make learning engaging and effective.'
  },
  {
    question: 'How much does it cost?',
    answer: 'Hallos is free to join. Explore free resources or enroll in paid classes and courses anytime.'
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  
  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-12">FAQs</h2>
        
        <Card variant="glass" className="max-w-5xl mx-auto p-4 sm:p-6">
          {FAQS.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex justify-between items-start gap-4 py-4 text-left hover:opacity-80 transition-opacity"
              >
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold flex-1">{faq.question}</h3>
                <div className="flex-shrink-0 mt-1">
                  {openIndex === index ? (
                    <span className='bg-[#FFFFFF1A] p-2 flex rounded-full items-center text-center'>

                    <ChevronUpIcon width={10} height={10} color="#F2F2F2" />
                    </span>
                  ) : (
                    <ChevronDownIcon width={17} height={9} color="#F2F2F2" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="pb-4 pr-4 sm:pr-8">
                  <p className="text-body text-sm sm:text-base">{faq.answer}</p>
                </div>
              )}
              
              {index < FAQS.length - 1 && (
                <div className="border-b border-border" />
              )}
            </div>
          ))}
        </Card>
      </div>
    </section>
  );
}