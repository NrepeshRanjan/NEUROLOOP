
import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  id: string; // Unique ID for the modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, id }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      aria-labelledby={`${id}-title`}
      aria-modal="true"
      role="dialog"
    >
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export { Modal };
