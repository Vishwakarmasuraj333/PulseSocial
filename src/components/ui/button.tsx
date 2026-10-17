import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#5846A8] hover:bg-[#48388d] text-white shadow-md shadow-purple-900/20 dark:bg-gradient-to-r dark:from-[#F59E0B] dark:via-[#E08738] dark:to-[#D97706] dark:hover:brightness-105 dark:text-slate-950 font-bold dark:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer",
        outline:
          "border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-purple-50 hover:text-[#5846A8] hover:border-purple-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-white/5 dark:hover:text-[#FBBF24] dark:hover:border-amber-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer",
        secondary:
          "bg-purple-50 text-[#5846A8] border border-purple-200/80 shadow-2xs hover:bg-purple-100 dark:bg-amber-500/10 dark:text-[#FBBF24] dark:border-amber-500/30 dark:hover:bg-amber-500/20 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer",
        ghost: "hover:bg-purple-50 hover:text-[#5846A8] dark:hover:bg-white/5 dark:hover:text-[#FBBF24] transition-all duration-200 cursor-pointer",
        link: "text-[#5846A8] dark:text-[#FBBF24] underline-offset-4 hover:underline cursor-pointer",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, cn };
