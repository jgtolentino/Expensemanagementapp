// components/ui/DataSourceBadge.tsx
// Visual indicator for Production vs Mock data
// Prevents stakeholders from confusing demo data with real figures

import React from 'react';
import { DataSourceType } from '../../lib/data/ppm-data-model';

interface DataSourceBadgeProps {
  source?: DataSourceType; // Optional in case data is missing meta
  className?: string;
  filename?: string;       // Optional: show source filename
  lastUpdated?: string;    // Optional: show last update time
  showTooltip?: boolean;   // Optional: show detailed tooltip
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ 
  source, 
  className = '',
  filename,
  lastUpdated,
  showTooltip = false
}) => {
  // Production Data Badge (Green - Real CSV Imports)
  if (source === 'production') {
    const tooltipText = filename 
      ? `Live data imported from ${filename}${lastUpdated ? ` on ${lastUpdated}` : ''}`
      : 'Live data from production source';

    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 ${className}`}
        title={showTooltip ? tooltipText : undefined}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_3s_infinite]" />
        <span>Live Data</span>
        {filename && (
          <span className="ml-1 px-1 py-0.5 rounded bg-green-200 text-[9px] font-mono">
            {filename}
          </span>
        )}
      </span>
    );
  }

  // Mock Data Badge (Amber - UI Placeholders/Demo)
  const tooltipText = 'Mock data for demonstration purposes only';

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 ${className}`}
      title={showTooltip ? tooltipText : undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      <span>Mock Data</span>
      {lastUpdated && (
        <span className="ml-1 text-[9px] opacity-70">
          {lastUpdated}
        </span>
      )}
    </span>
  );
};

// Alternative compact version for tight spaces
export const DataSourceDot: React.FC<{ source?: DataSourceType }> = ({ source }) => {
  if (source === 'production') {
    return (
      <span 
        className="inline-block w-2 h-2 rounded-full bg-green-500 animate-[pulse_3s_infinite]"
        title="Live production data"
      />
    );
  }
  
  return (
    <span 
      className="inline-block w-2 h-2 rounded-full bg-amber-400"
      title="Mock/demo data"
    />
  );
};

// Icon-based version with tooltip
export const DataSourceIcon: React.FC<DataSourceBadgeProps> = ({ 
  source, 
  className = '',
  filename 
}) => {
  if (source === 'production') {
    return (
      <span 
        className={`inline-flex items-center gap-1 text-green-600 ${className}`}
        title={filename ? `Verified data from ${filename}` : 'Verified production data'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    );
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 text-amber-600 ${className}`}
      title="Simulated demo data"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </span>
  );
};

export default DataSourceBadge;
