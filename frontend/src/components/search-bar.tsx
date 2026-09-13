"use client";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, KeyboardEvent, useState } from "react";

type Props = {
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  onSubmit?(text: string): void;
};

export default function SearchBar({
  className,
  placeholder,
  ariaLabel,
  onSubmit,
}: Props) {

  const [text, setText] = useState<string>("");
  const accessibleLabel = ariaLabel ?? placeholder ?? "搜尋 Search";

  function handleBlur() {
    onSubmit && onSubmit(text);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleBlur();
      (event.target as HTMLInputElement).blur();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
  }

  return (
    <label className={`relative block max-w-96 ${className ?? ""}`}>
      <span className="sr-only">{accessibleLabel}</span>
      <span className="absolute inset-y-0 left-0 flex flex-row items-center px-3 text-gray-600">
        <FontAwesomeIcon icon={faSearch} className="size-4" aria-hidden="true" />
      </span>
      <input
        type="text"
        aria-label={accessibleLabel}
        placeholder={placeholder ?? ""}
        value={text}
        className="w-full ps-10 pe-4 py-1.5 text-lg rounded-lg ring-1 ring-gray-200 outline-none focus:outline-none focus:ring-2 focus:ring-opacity-30 focus:ring-yellow-900 transition-all duration-200"
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
}
