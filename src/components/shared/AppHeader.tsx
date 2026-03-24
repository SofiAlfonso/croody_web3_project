import type { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  children?: ReactNode;
  sticky?: boolean;
  maxWidthClassName?: string;
  borderClassName?: string;
  titleClassName?: string;
  rightClassName?: string;
}

export default function AppHeader({
  title,
  children,
  sticky = false,
  maxWidthClassName = "max-w-6xl",
  borderClassName = "border-neutral-200",
  titleClassName = "text-neutral-900",
  rightClassName,
}: AppHeaderProps) {
  return (
    <header
      className={`border-b ${borderClassName} bg-white ${sticky ? "sticky top-0 z-10" : ""}`}
    >
      <div className={`${maxWidthClassName} mx-auto px-6 py-4 flex items-center justify-between`}>
        <div className={`text-xl font-semibold ${titleClassName}`}>{title}</div>
        {children && <div className={rightClassName}>{children}</div>}
      </div>
    </header>
  );
}
