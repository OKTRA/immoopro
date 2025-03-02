
import { useRef, useState, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  className?: string;
  children: React.ReactNode;
  highlightOnHover?: boolean;
  depthEffect?: boolean;
  subtle?: boolean;
  style?: CSSProperties;
}

export function AnimatedCard({ 
  className,
  children,
  highlightOnHover = false,
  depthEffect = false,
  subtle = false,
  style: externalStyle = {},
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !depthEffect) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  };

  // Calculate card rotation based on mouse position
  const rotateX = depthEffect ? (mousePosition.y - 0.5) * 4 : 0;
  const rotateY = depthEffect ? (mousePosition.x - 0.5) * -4 : 0;

  const baseStyles = "overflow-hidden rounded-lg border bg-card text-card-foreground transition-all duration-200";
  const hoverStyles = highlightOnHover 
    ? "hover:border-primary/20 hover:shadow-md hover:shadow-primary/5" 
    : "";
  const depthStyles = depthEffect
    ? "transform-gpu transition-transform"
    : "";
  const subtleStyles = subtle 
    ? "border-transparent shadow-sm" 
    : "";

  const internalStyle: CSSProperties = depthEffect
    ? {
        transform: isHovering
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d" as const,
      }
    : {};

  // Merge internal and external styles
  const combinedStyle = { ...internalStyle, ...externalStyle };

  return (
    <div
      ref={cardRef}
      className={cn(baseStyles, hoverStyles, depthStyles, subtleStyles, className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={combinedStyle}
    >
      <div 
        className="relative"
        style={{ 
          transformStyle: "preserve-3d" as const,
          zIndex: 1 
        }}
      >
        {children}
      </div>
    </div>
  );
}
