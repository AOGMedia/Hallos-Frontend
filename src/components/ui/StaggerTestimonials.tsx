"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import QuoteIcon from "@/components/icons/QuoteIcon";

const SQRT_5000 = Math.sqrt(5000);

// Using your existing testimonials data structure
const testimonials = [
  {
    tempId: 0,
    rating: 5.0,
    title: "It's a blast!",
    testimonial:
      "Watching live interactive sessions has been a blast. It's a flexible way of learning, easy to understand and apply. It's a fun and effective way to level up my skills.",
    author: "Opeyemi T. Jamiu",
    role: "Senior UX Designer, Nigeria",
    avatar: "OJ",
  },
  {
    tempId: 1,
    rating: 4.0,
    title: "Great learning experience",
    testimonial:
      "The interactive sessions are really helpful and I've learned quite a bit. The platform is user-friendly and instructors are knowledgeable. Looking forward to more advanced content!",
    author: "Sarah Chen",
    role: "Product Manager, Singapore",
    avatar: "SC",
  },
  {
    tempId: 2,
    rating: 5.0,
    title: "Incredible platform!",
    testimonial:
      "The quality of instructors and the live interaction capability sets this platform apart. It's like having a personal mentor available 24/7. Absolutely love it!",
    author: "Marcus Johnson",
    role: "Software Engineer, USA",
    avatar: "MJ",
  },
  {
    tempId: 3,
    rating: 3.0,
    title: "Good foundation for learning",
    testimonial:
      "The content provides a solid foundation and the live sessions are engaging. Perfect for getting started and building confidence. I appreciate the supportive community here.",
    author: "Priya Sharma",
    role: "Marketing Director, India",
    avatar: "PS",
  },
  {
    tempId: 4,
    rating: 4.0,
    title: "Valuable skills gained",
    testimonial:
      "I've gained valuable skills that helped advance my career. The platform is intuitive and the instructors make complex topics accessible. Great investment in my future!",
    author: "David Kim",
    role: "Data Scientist, South Korea",
    avatar: "DK",
  },
  {
    tempId: 5,
    rating: 5.0,
    title: "Community is amazing!",
    testimonial:
      "Not just the learning content, but the community of learners and creators makes this platform special. The networking opportunities are endless. Truly exceptional experience!",
    author: "Elena Rodriguez",
    role: "UX Researcher, Spain",
    avatar: "ER",
  },
  {
    tempId: 6,
    rating: 2.0,
    title: "Good for beginners",
    testimonial:
      "As someone new to the field, this platform gave me the confidence to start learning. The basic content is well-explained and the community is welcoming. A great stepping stone!",
    author: "Ahmed Hassan",
    role: "Business Analyst, Egypt",
    avatar: "AH",
  },
  {
    tempId: 7,
    rating: 4.0,
    title: "Flexible and convenient",
    testimonial:
      "The live sessions fit perfectly into my busy schedule and is a lifesaver. Quality content delivered in an engaging way. Definitely recommend trying it out!",
    author: "Lisa Thompson",
    role: "Creative Director, Canada",
    avatar: "LT",
  },
   {
    tempId: 8,
    rating: 4.0,
    title: "Hallo changed my learning game",
    testimonial:
      "The interactive live sessions have transformed how I learn. The flexibility and engagement make it easy to absorb new information. Highly recommend to anyone looking to upskill!",
    author: "Gracious Kingsley",
    role: "Senior Software Engineer, Nigeria",
    avatar: "GK",
  },
];

interface TestimonialCardProps {
  position: number;
  testimonial: (typeof testimonials)[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer transition-all duration-500 ease-in-out",
        "flex flex-col gap-3 p-4 sm:p-6 rounded-lg",
        isCenter
          ? "z-10 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 backdrop-blur-sm"
          : "z-0 bg-background-dark/80 border border-border backdrop-blur-sm hover:border-primary/30",
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `translate(-50%, -50%) translateX(${(cardSize / 1.5) * position}px) translateY(${
          isCenter ? -65 : position % 2 ? 15 : -15
        }px) rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)`,
        boxShadow: isCenter
          ? "0px 8px 0px 4px rgba(106, 87, 229, 0.3)"
          : "0px 0px 0px 0px transparent",
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <div className="flex items-center text-center ">
        {/* Avatar */}
        <div className="glass-effect p-7 w-12 h-12 rounded-full bg-text-muted/10 flex items-center justify-center font-bold text-base flex-shrink-0 mb-2">
          {testimonial.avatar}
        </div>

        {/* Author info */}
        <div className="mt-auto">
          <div className="flex flex-col">
            <span
              className={cn(
                "text-sm font-medium",
                isCenter ? "text-text-primary" : "text-text-secondary",
              )}
            >
              - {testimonial.author}
            </span>
            <span
              className={cn(
                "text-xs italic",
                isCenter ? "text-text-secondary/80" : "text-text-muted",
              )}
            >
              {testimonial.role}
            </span>
          </div>
        </div>
      </div>
      {/* Rating */}
      <Rating
        rating={testimonial.rating}
        showValue
        size="md"
        className="flex mb-2"
      />

      {/* Title */}
      <h3
        className={cn(
          "text-lg sm:text-xl font-bold mb-2",
          isCenter ? "text-text-primary" : "text-text-primary",
        )}
      >
        &ldquo;{testimonial.title}&rdquo;
      </h3>

      {/* Testimonial content */}
      <p
        className={cn(
          "text-xs sm:text-sm leading-relaxed flex-1",
          isCenter ? "text-text-secondary" : "text-text-muted",
        )}
      >
        {testimonial.testimonial}
      </p>

      {/* Quote icon */}
      <div className="absolute top-4 right-4 opacity-30">
        <QuoteIcon width={40} height={30} className="text-text-muted" />
      </div>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];

    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }

    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      // Increased mobile size from 290 to 320 to fit content better
      setCardSize(matches ? 365 : 340);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-background-darker/50 rounded-lg"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position =
          testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2;

        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}

      {/* Navigation buttons */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors rounded-lg",
            "bg-background-dark/80 border-2 border-border backdrop-blur-sm",
            "hover:bg-primary hover:text-text-primary hover:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors rounded-lg",
            "bg-background-dark/80 border-2 border-border backdrop-blur-sm",
            "hover:bg-primary hover:text-text-primary hover:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};
