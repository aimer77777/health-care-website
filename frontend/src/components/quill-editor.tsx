"use client";

import "./quill.css";
import dynamic from "next/dynamic";
import type ReactQuillType from "react-quill";
import type { DeltaStatic, Sources } from "quill";
import React, { useMemo, useRef, useState } from "react";
import ImageRepoImpl from "@/module/image/presenter/imageRepoImpl";
import ImageUsecase from "@/module/image/application/imageUsecase";
import ImageViewModel from "@/module/image/presenter/imageViewModel";

const ReactQuill = dynamic(async () => {
  const reactQuillModule = await import("react-quill");
  const imageResizeModule = await import("quill-image-resize-module-ts");
  const Quill = reactQuillModule.Quill ?? reactQuillModule.default.Quill;
  Quill.register("modules/imageResize", imageResizeModule.ImageResize);
  return reactQuillModule.default;
}, { ssr: false }) as any;

type Props = {
  className?: string;
  label?: string;
  value?: ReactQuillType.Value;
  onChange?(value: string, delta: DeltaStatic, source: Sources, editor: ReactQuillType.UnprivilegedEditor): void;
};

export default function QuillEditor({
  className,
  label,
  value,
  onChange,
}: Props) {
  const quillRef = useRef<ReactQuillType | null>(null);

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: async function () {
          const fileInput = document.createElement("input")
          fileInput.setAttribute("type", "file");
          fileInput.setAttribute("accept", "image/*");
          fileInput.click();

          fileInput.onchange = () => {
            const file = fileInput.files?.item(0);
            if (!file) return;

            const usecase = new ImageUsecase(new ImageRepoImpl());

            usecase.uploadImage(file).then((image) => {
              const vm = new ImageViewModel(image);
              const editor = quillRef.current?.getEditor();
              if (!editor) return;
              const range = editor.getSelection();
              editor.insertEmbed(range?.index ?? 0, "image", vm.url);
            });
          };
        }
      },
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  }), []);

  return (
    <div className={`${className} w-full`}>
      {label && <label htmlFor={label} className="label">{label}</label>}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        className={`w-full text-lg rounded-lg outline-none transition-all duration-200
            ${isFocus ? "ring-opacity-30 ring-yellow-900 ring-2" : "ring-gray-200 ring-1"}`}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </div>
  );
}
