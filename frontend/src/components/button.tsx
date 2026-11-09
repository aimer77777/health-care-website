import { MouseEventHandler } from "react";

type Props = {
  className?: string;
  children: Readonly<React.ReactNode>;
  title?: string;
  ariaLabel?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaHasPopup?: "menu" | "listbox" | "tree" | "grid" | "dialog";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  className,
  children,
  title,
  ariaLabel,
  ariaControls,
  ariaExpanded,
  ariaHasPopup,
  disabled = false,
  onClick
}: Props) {
  return (
      <button
        title={title}
        aria-label={ariaLabel ?? title}
        aria-controls={ariaControls}
        aria-expanded={ariaExpanded}
        aria-haspopup={ariaHasPopup}
        className={`${className ?? ""} flex flex-row items-center px-3 py-1 rounded-full
          ${disabled ? "text-gray-300" : "hover:bg-opacity-5 hover:bg-black transition-colors"}`}
        disabled={disabled}
        type="button"
        onClick={onClick}
      >
        {children}
      </button>
  )
}
