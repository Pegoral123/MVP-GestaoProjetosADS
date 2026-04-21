import * as React from "react"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full px-4 py-3 text-base",

        "bg-white shadow-sm transition-all duration-300",

        "text-foreground placeholder:text-muted-foreground",

        "outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",

        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        "md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input }