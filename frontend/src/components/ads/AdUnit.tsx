import React from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '', 
  style = {} 
}) => {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (!adsenseId) {
    // Placeholder for development
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center p-4 my-4 font-mono text-xs text-gray-400 rounded-lg ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        AD UNIT PLACEHOLDER [Slot: {slot}]
      </div>
    );
  }

  return (
    <div className={`adsense-container my-4 ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: '(window.adsbygoogle = window.adsbygoogle || []).push({});',
        }}
      />
    </div>
  );
};

export default AdUnit;
