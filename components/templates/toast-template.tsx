'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import { Check, CheckCircle2, X } from 'lucide-react';
import { Toaster } from '../ui/sonner';
import { Separator } from '../ui/separator';

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  type: 'success' | 'failure';
  onClose?: () => void;
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toastProps: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toastProps.title}
      description={toastProps.description}
      type={toastProps.type}
      onClose={toastProps.onClose}
    />
  ));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, type, id } = props;

  const isSuccess = type === 'success';

  return (
    <div 
      className="flex rounded-2xl border w-[385px] items-center p-4 gap-4 relative overflow-hidden bg-white"
    >
      {/* Gradient overlay - only covers 1/3 of the width with slight slant */}
      {isSuccess && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 rounded-l-2xl"
          style={{
            background: 'linear-gradient(115deg, #c7edd4, #c7edd4, #c7edd4, #c7edd4,#c7edd4,#FFFFFF,  #FFFFFF,  #FFFFFF,   #FFFFFF)',
          }}
        />
      )}

      {/* Content - positioned above gradient */}
      <div className="relative z-10 flex items-center gap-4 w-full min-h-[40px]">
        {/* Success Icon */}
        {isSuccess && (
          <div className="shrink-0 relative">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 "
              style={{
                // backgroundColor: '#0F973D',
                boxShadow: '0 0 0 2px rgba(15, 151, 61, 0.2)',
              }}
            >
              <Check className="w-5 h-5 text-white bg-[#099137] rounded-full p-1 " />
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-0.5">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <div className='self-stretch w-[1.5px] bg-[#F0F2F5]' />

        {/* Close Button */}
        <button
          onClick={() => {
            sonnerToast.dismiss(id);
            props.onClose?.();
          }}
          className="shrink-0 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ToastTemplate() {
  return <Toaster position="top-right" duration={3000} />
}

// Convenience function for showing success/failure toasts
export function showToast(type: 'success' | 'failure', message: string, title?: string) {
  toast({
    title: title || (type === 'success' ? 'Success' : 'Error'),
    description: message,
    type,
  })
}
