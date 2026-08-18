import React from 'react';

export default function SOPScreenshot({ src, alt = 'SOP screenshot' }) {
  return <img src={src} alt={alt} className="w-full my-1" />;
}
