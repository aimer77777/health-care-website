"use client";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId, useState } from "react";

type Props = {
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
  title: string;
};

export default function ExpensionTile({ className, titleClassName, children, title }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const panelId = `expansion-${useId().replace(/:/g, "")}`;

  const toggleIsOpen = () => {
    setIsOpen((value) => (!value));
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-start h-fit w-full">
        <h3 className="w-full">
          <button
            type="button"
            className={`${titleClassName ?? ""} flex w-full items-center justify-between text-left`}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={toggleIsOpen}
          >
            <span>{title}</span>
            <div className="h-4 w-4 overflow-clip">
              <FontAwesomeIcon aria-hidden="true" icon={faAngleDown} className={`transform ${isOpen ? "rotate-180" : "rotate-0"} transition-transform ease-in-out`} />
            </div>
          </button>
        </h3>
        <div id={panelId} hidden={!isOpen} className="w-full overflow-hidden">
          <div className={`flex flex-col items-start transform ${isOpen ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-2 opacity-0 pointer-events-none"} transition-all duration-300 ease-in-out w-full`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
