import React from "react";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

function Icon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
  ...props
}: IconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as
    | React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>
    | undefined;

  if (!IconComponent) {
    return (
      <HelpCircle
        size={size}
        color="gray"
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      width={size}
      height={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}
export default Icon;
