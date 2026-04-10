import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline } from 'react-icons/io5';
import Button from './Button';

const positionStyles = {
  center: {
    wrapper: 'items-center justify-center p-4',
    panel: 'rounded-[10px]',
  },
  right: {
    wrapper: 'items-stretch justify-end p-0 sm:p-4',
    panel: 'h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] rounded-[10px]',
  },
  left: {
    wrapper: 'items-stretch justify-start p-0 sm:p-4',
    panel: 'h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] rounded-[10px]',
  },
};

export default function Modal({
  isOpen,
  onClose,
  children,
  position = 'center',
  width = 'max-w-2xl',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  overlayClassName = '',
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const currentPosition = positionStyles[position] || positionStyles.center;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-[2px] ${currentPosition.wrapper} ${overlayClassName}`}
      onClick={() => {
        if (closeOnOverlayClick) {
          onClose?.();
        }
      }}
      role="presentation"
    >
      <div
        className={`relative w-full bg-white shadow-2xl ${width} ${currentPosition.panel} ${className}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton ? (
          <Button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 items-center justify-center rounded-full bg-white p-2 text-secondary hover:bg-gray-50"
            aria-label="Close modal"
          >
            <IoCloseOutline size={20} />
          </Button>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
