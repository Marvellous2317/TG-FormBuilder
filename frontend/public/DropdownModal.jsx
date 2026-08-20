import React from 'react';
import Modal from '../src/shared/components/Modal';
import Button from '../src/shared/components/Button';
import Loader from '../src/shared/components/Loader';

export default function DropdownModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Switch Workspace?',
  message,
  targetName,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  isLoading = false,
  icon,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      position="center"
      width="max-w-[386px]"
      className="overflow-hidden"
    >
      <div className="flex h-full flex-col p-5">
        {/* Icon */}
        <div className="mt-9 flex justify-center items-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-primary-50 text-primary-200 rounded-xl border border-secondary-200 shadow-sm bg-secondary-700">
            {icon || (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-0.5 w-full text-center flex items-center flex-col">
          {/* <p className="text-base font-semibold font-geist text-primary">
            {title}
          </p> */}
          <p className="text-sm font-geist w-3/4 text-tertiary">
            {message || (
              <>
                Do you want to switch to{' '}
                <span className="font-semibold text-primary">
                  {targetName}
                </span>
                ?
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center mt-6 justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-[10px] bg-tertiary-200 px-4 py-2.5 text-sm font-medium font-geist text-secondary"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="rounded-[10px] flex items-center gap-2 bg-primary-200 px-4 py-2.5 text-sm font-medium font-geist text-white"
          >
            {confirmText}
            {isLoading && <Loader size="border-white! h-4.5 w-4.5" />}
          </Button>
        </div>
      </div>
    </Modal>
  );
}