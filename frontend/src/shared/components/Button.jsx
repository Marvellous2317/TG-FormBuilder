import React from 'react';

export default function Button({
  children,
  onClick = () => {},
  className = '',
  type = 'submit',
  ...props
}) {
  return (
    <button
      className={`flex items-center ease-in-out cursor-pointer active:scale-95 transition-all duration-150 ${className}`}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
