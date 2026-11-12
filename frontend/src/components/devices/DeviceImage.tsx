'use client';

import React from 'react';
import Image from 'next/image';

interface DeviceImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
}

/**
 * Device image with graceful degradation: remote device images (phonedb.net
 * etc.) are frequently unreachable or blocked by TLS issues, and the Next.js
 * image optimizer then 500s. This component falls back to a placeholder
 * instead of rendering a broken image.
 */
const DeviceImage: React.FC<DeviceImageProps> = ({
  src,
  alt,
  className,
  style,
  sizes,
  priority,
  fallbackLabel = 'No Image',
}) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div className="flex flex-col items-center text-on-surface-variant">
        <span className="material-symbols-outlined text-[40px] mb-1 opacity-40" aria-hidden="true">
          mobile_off
        </span>
        <span className="font-body-sm text-body-sm">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      style={style}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
};

export default DeviceImage;
