import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "success"
    | "warning";
  size?: "sm" | "md" | "lg" | "icon" | "compact";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 select-none rounded-sm border";

    const variantStyles = {
      default:
        "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:border-white dark:hover:bg-neutral-100 shadow-sm",
      secondary:
        "bg-neutral-100 text-neutral-900 border-neutral-200 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700",
      outline:
        "bg-transparent text-neutral-800 border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white",
      ghost:
        "bg-transparent text-neutral-700 border-transparent hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white",
      destructive:
        "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:border-rose-700 dark:hover:bg-rose-600 shadow-sm",
      success:
        "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:border-emerald-700 dark:hover:bg-emerald-600 shadow-sm",
      warning:
        "bg-amber-600 text-white border-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:border-amber-700 dark:hover:bg-amber-600 shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      compact: "h-7 px-2 text-[11px] gap-1",
      md: "h-9 px-3.5 text-xs tracking-wide gap-2",
      lg: "h-10 px-4 text-sm gap-2",
      icon: "h-8 w-8 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
