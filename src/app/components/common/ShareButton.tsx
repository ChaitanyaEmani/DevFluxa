import React from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButton({ url, title, className = '' }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors ${className}`}
    >
      Share
    </button>
  );
}
