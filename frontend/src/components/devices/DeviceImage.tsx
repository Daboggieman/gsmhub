'use client';

import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileScreen } from '@fortawesome/free-solid-svg-icons';

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
      <div className="flex flex-col items-center text-gray-400">
        <FontAwesomeIcon icon={faMobileScreen} className="text-4xl mb-2 opacity-20" />
        <span className="text-xs font-medium">{fallbackLabel}</span>
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
