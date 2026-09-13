"use client";

import { useId } from "react";

type Props = {
  hidden?: boolean;
  className?: string;
  label?: string;
  labelText?: string;
  options: string[];
  index?: number;
  onChange(index: number): void;
};

export default function RadioField({
  hidden,
  className,
  label,
  labelText,
  options,
  index = -1,
  onChange,

}: Props) {
  const generatedId = useId();
  const groupId = generatedId;
  const legendId = `${groupId}-legend`;

  return (
    <div hidden={hidden} className={className}>
      {label && <span id={legendId} className="label">{labelText ?? label}</span>}
      <fieldset className="flex flex-row gap-3 items-center" aria-labelledby={label ? legendId : undefined}>
        {
          options.map((option, currentIndex) => {
            const optionId = `${groupId}-${currentIndex}`;
            return (
              <div key={currentIndex}>
                <input
                  id={optionId}
                  type="radio"
                  name={groupId}
                  value={option}
                  checked={currentIndex === index}
                  onChange={() => onChange(currentIndex)}
                />
                <label htmlFor={optionId} className="ms-1">{option}</label>
              </div>
            );
          })
        }
      </fieldset>
    </div>
  );
}
