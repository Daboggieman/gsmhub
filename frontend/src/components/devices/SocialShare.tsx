"use client";

import React from 'react';
import { FaWhatsapp, FaTwitter, FaFacebookF, FaShareAlt } from 'react-icons/fa';

interface SocialShareProps {
  url: string;
  title: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title }) => {
  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp />,
      color: 'bg-[#25D366]',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
    },
    {
      name: 'Twitter',
      icon: <FaTwitter />,
      color: 'bg-[#1DA1F2]',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: <FaFacebookF />,
      color: 'bg-[#4267B2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url,
      }).catch(console.error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 my-6">
      <span className="text-sm font-semibold text-gray-700 mr-2">Share:</span>
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${link.color} text-white p-2 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center w-9 h-9`}
            title={`Share on ${link.name}`}
          >
            {link.icon}
          </a>
        ))}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="bg-gray-800 text-white p-2 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center w-9 h-9"
            title="Other share options"
          >
            <FaShareAlt />
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialShare;
