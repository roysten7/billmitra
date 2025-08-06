import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, ...props }, ref) => {
  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        "bg-gray-300 data-[state=checked]:bg-blue-600", // Force visible colors
        className
      )}
      checked={checked}
      {...props}
      ref={ref}
    >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform border border-gray-300",
        checked ? "translate-x-5" : "translate-x-0"
      )}
      style={{
        transform: checked ? 'translateX(20px)' : 'translateX(0px)',
        transition: 'transform 0.2s ease-in-out'
      }}
    />
  </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch } 