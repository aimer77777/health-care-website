"use client";

import { KeyboardEvent, useId, useRef, useState } from "react";

type Props = {
  className?: string,
  textClassName?: string,
  options: string[],
  onChange?(index: number): void,
  id?: string,
  panelId?: string,
  ariaLabel?: string,
};

export default function GroupedButton({
  className,
  textClassName,
  options,
  onChange,
  id,
  panelId,
  ariaLabel,
}: Props) {
  const [selected, setSelected] = useState<number>(0);
  const generatedId = useId().replace(/:/g, "");
  const tabListId = id ?? `tabs-${generatedId}`;
  const tabListRef = useRef<HTMLDivElement>(null);

  const selectTab = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      nextIndex = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === "Home")
      nextIndex = 0;
    else if (event.key === "End")
      nextIndex = options.length - 1;
    else
      return;

    event.preventDefault();
    selectTab(nextIndex);
    tabListRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']")[nextIndex]?.focus();
  };

  return (
    <div className={className}>
      <div ref={tabListRef} className="flex flex-row divide-x" role="tablist" aria-label={ariaLabel}>
        {
          options.map((label, index) => (
            <button
              type="button"
              key={index}
              id={`${tabListId}-tab-${index}`}
              role="tab"
              aria-selected={index === selected}
              aria-controls={panelId}
              tabIndex={index === selected ? 0 : -1}
              className={`flex-auto text-center cursor-pointer ${index === selected ? "bg-yellow-700 bg-opacity-5" : "bg-opacity-0"} transition-colors ease-in-out duration-200`}
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <div className={`py-3 bg-black bg-opacity-0 ${index !== selected && "hover:bg-opacity-5"} transition-colors ease-in-out duration-200`}>
                <span className={textClassName}>{label}</span>
              </div>
            </button>
          ))
        }
      </div>
    </div>
  )
}
