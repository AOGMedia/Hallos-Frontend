"use client";

import React, { useState } from 'react';

interface RaiseHandButtonProps {
  onRaiseHand: () => void;
  onLowerHand: () => void;
}

export const RaiseHandButton: React.FC<RaiseHandButtonProps> = ({
  onRaiseHand,
  onLowerHand,
}) => {
  const [isRaised, setIsRaised] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRaiseHand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Raise hand clicked');
    setIsRaised(true);
    setShowFeedback(true);
    setIsExpanded(true);
    onRaiseHand();
    
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleLowerHand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Lower hand clicked');
    setIsRaised(false);
    setShowFeedback(true);
    setIsExpanded(false);
    onLowerHand();
    
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRaised) {
      setIsExpanded(!isExpanded);
    }
  };

  console.log('RaiseHandButton rendering, isRaised:', isRaised);

  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px'
      }}
    >
      {/* Feedback Toast */}
      {showFeedback && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(to bottom right, #FBBF24, #F97316)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ color: 'white', fontSize: '14px' }}>
                {isRaised ? '✋' : '👋'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                {isRaised ? 'Hand Raised!' : 'Hand Lowered'}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                {isRaised ? 'Waiting for host approval' : 'Request cancelled'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={isExpanded ? (isRaised ? handleLowerHand : handleRaiseHand) : handleToggle}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '9999px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          cursor: 'pointer',
          background: isRaised
            ? 'linear-gradient(to bottom right, #6B7280, #4B5563)'
            : 'linear-gradient(to bottom right, #FBBF24, #F97316)',
          border: 'none',
          padding: isExpanded ? '16px 24px' : '12px',
          display: 'flex',
          alignItems: 'center',
          gap: isExpanded ? '12px' : '0',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: isExpanded ? '24px' : '20px' }}>
          {isRaised ? '👋' : '✋'}
        </span>
        {isExpanded && (
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
            {isRaised ? 'Lower Hand' : 'Raise Hand'}
          </span>
        )}
      </button>

      {/* Status Indicator */}
      {isRaised && (
        <div
          style={{
            background: 'white',
            borderRadius: '9999px',
            padding: '8px 16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#EAB308',
                borderRadius: '50%'
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
              Waiting for host...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
