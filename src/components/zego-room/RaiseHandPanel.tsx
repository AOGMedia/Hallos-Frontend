"use client";

import React, { useState } from 'react';

interface RaiseHandRequest {
  userId: string;
  name: string;
  timestamp?: number;
}

interface RaiseHandPanelProps {
  requests: RaiseHandRequest[];
  onAllow: (userId: string) => void;
  onDismiss: (userId: string) => void;
}

export const RaiseHandPanel: React.FC<RaiseHandPanelProps> = ({
  requests,
  onAllow,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleAllow = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    console.log('Allow clicked for:', userId);
    onAllow(userId);
  };

  const handleDismiss = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    console.log('Dismiss clicked for:', userId);
    onDismiss(userId);
  };

  console.log('RaiseHandPanel rendering, requests:', requests.length, requests);

  // Always show panel for host (even with 0 requests for debugging)
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        width: isExpanded ? '320px' : '60px',
        background: 'linear-gradient(to bottom right, #9333EA, #2563EB)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.1)',
          cursor: 'move',
          gap: '8px'
        }}
      >
        {isExpanded ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  background: '#FBBF24',
                  borderRadius: '50%'
                }}
              />
              <h3 style={{ fontWeight: 'bold', color: 'white', fontSize: '14px', margin: 0 }}>
                Raise Hand ({requests.length})
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleToggleExpand}
                style={{
                  color: 'white',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                −
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 'bold', color: 'white', fontSize: '18px', margin: 0 }}>
              {requests.length}
            </span>
            <button
              onClick={handleToggleExpand}
              style={{
                color: 'white',
                background: 'transparent',
                border: 'none',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              +
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
          {requests.length === 0 ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
              No requests yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {requests.map((req) => (
                <div
                  key={req.userId}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(to bottom right, #FBBF24, #F97316)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <span style={{ color: 'white', fontSize: '14px' }}>✋</span>
                      </div>
                      <span
                        style={{
                          color: '#1F2937',
                          fontWeight: 500,
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {req.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => handleAllow(e, req.userId)}
                        style={{
                          background: '#10B981',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
                      >
                        Allow
                      </button>
                      <button
                        onClick={(e) => handleDismiss(e, req.userId)}
                        style={{
                          background: '#EF4444',
                          color: 'white',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#DC2626'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#EF4444'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
