import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

export default function Avatar({ src, name, className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const getInitial = (name: string | null | undefined) => {
    if (!name || name.trim() === '') return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const isRoundedCustom = className.includes('rounded-');
  const baseClasses = `flex-shrink-0 flex items-center justify-center font-bold text-brand-on-surface bg-brand-surface-low border border-brand-outline-variant/30 ${!isRoundedCustom ? 'rounded-full' : ''} ${className}`;

  if (src && !imgError) {
    return (
      <img
        alt={name || 'Avatar'}
        className={`object-cover ${!isRoundedCustom ? 'rounded-full' : ''} ${className}`}
        src={src}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={baseClasses}>
      {getInitial(name)}
    </div>
  );
}
