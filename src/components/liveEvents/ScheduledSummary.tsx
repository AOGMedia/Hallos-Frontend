"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import ShareIcon from "@/components/icons/ShareIcon";
import PeopleIcon from "@/components/icons/PeopleIcon";
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
} from "@/utils/formatters";
import LiveButton from "../ui/LiveButton";
import { Check } from "lucide-react";

interface ScheduledSummaryProps {
  title: string;
  currency: string;
  price: string;
  date: string;
  startTime: string;
  endTime: string;
  inviteCount: number;
  paymentCompleted: number;
  totalEarned: number;
  onShareInvite: () => void;
  onViewPayments?: () => void;
  onViewEarnings?: () => void;
  onStartClass: () => void;
  onDelete?: () => void;
}

export default function ScheduledSummary({
  title,
  currency,
  price,
  date,
  startTime,
  endTime,
  inviteCount,
  paymentCompleted,
  totalEarned,
  onShareInvite,
  onViewPayments,
  onViewEarnings,
  onStartClass,
  onDelete,
}: ScheduledSummaryProps) {
  const dateLabel = formatDateLabel(date);
  const timeLabel = `${formatTimeLabel(startTime)} To ${formatTimeLabel(
    endTime
  )}`;
  const priceLabel = formatCurrency(price, currency);
  const earnedLabel = formatCurrency(totalEarned, currency);

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Class Details */}
      <Card variant="feature" className="live-event-card flex-1 bg-[#1F2636] shadow-2xl shadow-black/80">
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-card">Class Details:</h3>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="live-event-label">Class Name</label>
            <div className="live-event-input">
              <span className="live-event-input-text block truncate">
                {title}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="live-event-label">Price</label>
            <div className="live-event-input flex items-center justify-between">
              <span className="live-event-input-text">{currency}</span>
              <span className="live-event-input-text font-semibold">
                {priceLabel.replace(`${currency} `, "")}
              </span>
              <button className="text-small underline opacity-80 hover:opacity-100">
                Edit Price
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="live-event-label">Date & Time</label>
            <div className="live-event-input">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <span className="live-event-input-text">{dateLabel}</span>
                <span className="live-event-input-text">{timeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment & Invites */}

      <div className="flex-1">
        <Card
          variant="feature"
          className="live-event-card  bg-[#1F2636] shadow-2xl shadow-black/80 mb-6 md:px-2!  "
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="heading-card">Payment & Invites</h3>
            <button
              onClick={onShareInvite}
              className="flex items-center gap-2 text-primary hover:opacity-80 cursor-pointer"
            >
              <ShareIcon width={18} height={18} />
              <span className="live-event-link-text">Share Invite</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pb-10">
            {/* invitee */}
            <div>
              <span className="live-event-input-text">Invite sent to</span>
              <div className="live-event-input flex items-center justify-between col-span-1">
                <div className="flex items-center gap-3">
                  <PeopleIcon width={10} height={10} />
                </div>
                <span className="live-event-input-text font-semibold">
                  {inviteCount} people
                </span>
              </div>
            </div>
            {/* completed payment  */}
            <div className="col-span-2">
              <span className="live-event-input-text">Completed payments</span>
              <div className="live-event-input flex items-center justify-between">
                <div className="flex items-center bg-[#1DBF53] p-2 rounded-full ">
                  <Check width={10} height={10} color="#1F2636"/>
                
                </div>
                <div className="flex items-center gap-3">
                  <span className="live-event-input-text font-semibold">
                    {paymentCompleted}/{inviteCount} people
                  </span>
                  <button
                    onClick={onViewPayments}
                    className="text-small underline opacity-80 hover:opacity-100"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className=" flex flex-col items-start ">
            <span className="live-event-input-text pb-4">Total Earned</span>
            <div className="flex justify-between items-center gap-3 live-event-input w-full">
              <span className="live-event-input-text font-semibold flex gap-4">
                {currency}

                <span className="live-event-input-text font-semibold">
                  {earnedLabel.replace(`${currency} `, "")}
                </span>
              </span>
              <button
                onClick={onViewEarnings}
                className="text-small underline opacity-80 hover:opacity-100"
              >
                View Details
              </button>
            </div>
          </div>
        </Card>
        <div className={`flex w-full items-center ${onDelete ? 'justify-between' : 'justify-end'}`}>
          {onDelete && (
            <button 
              onClick={onDelete}
              className="px-6 py-2 rounded-full border border-red-500/50 text-red-500 font-semibold hover:bg-red-500/10 transition-colors"
            >
              Delete Class
            </button>
          )}
          <LiveButton onClick={onStartClass}>Start Class</LiveButton>
        </div>
      </div>
    </div>
  );
}
