import * as React from "react";

export const Textarea = React.forwardRef(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={
          `w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white 
           placeholder:text-gray-400 focus:outline-none focus:ring-2 
           focus:ring-blue-500 resize-none ${className}`
        }
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
