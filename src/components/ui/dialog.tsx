import * as React from "react";
import { cn } from "./button";
import { X } from "lucide-react";

interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export function Dialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
  className,
  showCloseButton = true,
}: DialogProps) {
  const isCurrentlyOpen = open !== undefined ? open : !!isOpen;
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isCurrentlyOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCurrentlyOpen]);

  if (!isCurrentlyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
      {/* Backdrop with smooth fade animation */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Window with smooth zoom & scale animation */}
      <div
        className={cn(
          "relative z-50 w-full h-full md:h-auto max-md:max-h-full rounded-none md:rounded-2xl bg-white shadow-2xl border border-slate-200/90 dark:bg-slate-900 dark:border-slate-800 p-4 md:p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ease-out",
          maxWidth,
          className
        )}
      >
        {/* Animated Close Button (Only if showCloseButton is true) */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="group absolute right-4 top-4 z-50 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-2xs"
            title="Close (Esc)"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        )}

        {title && (
          <div className="mb-4 pr-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
