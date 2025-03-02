
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ButtonEffectsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "ghost" | "subtle";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function ButtonEffects({
  className,
  variant = "default",
  size = "default",
  fullWidth,
  children,
  ...props
}: ButtonEffectsProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = "relative overflow-hidden focus-ring rounded-md font-medium transition-all duration-200 ease-out";

  const variantStyles = {
    default: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    outline: "border border-input bg-transparent hover:bg-secondary/50 text-foreground",
    ghost: "hover:bg-secondary/50 text-foreground",
    subtle: "bg-secondary/50 hover:bg-secondary text-foreground",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5",
    default: "text-sm px-4 py-2",
    lg: "text-base px-5 py-3",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthClass,
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        transform: isPressed ? "scale(0.98)" : "scale(1)",
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {isHovering && (
        <span
          className="absolute inset-0 bg-black/5 dark:bg-white/5 animate-fade-in"
          style={{ 
            animationDuration: "0.15s", 
            animationFillMode: "forwards"
          }}
        />
      )}
    </button>
  );
}
