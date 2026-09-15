"use client";

import "./quill.css";
import dynamic from "next/dynamic";
import type ReactQuillType from "react-quill";
import type { DeltaStatic, Sources } from "quill";
import React, { Component, ReactNode, useMemo, useRef, useState } from "react";
import ImageRepoImpl from "@/module/image/presenter/imageRepoImpl";
import ImageUsecase from "@/module/image/application/imageUsecase";
import ImageViewModel from "@/module/image/presenter/imageViewModel";

const ReactQuill = dynamic(async () => {
  const reactQuillModule = await import("react-quill");
  const Quill = reactQuillModule.Quill ?? reactQuillModule.default.Quill;

  try {
    const imageResizeModule = await import("quill-image-resize-module-ts");
    Quill.register("modules/imageResize", imageResizeModule.ImageResize);
  } catch (err) {
    console.warn("Quill image resize module failed to load:", err);
  }

  return reactQuillModule.default;
}, {
  ssr: false,
  loading: () => <EditorFallback />,
}) as any;

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
      <QuillErrorBoundary value={value} onChange={onChange}>
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
      </QuillErrorBoundary>
    </div>
  );
}

type FallbackProps = {
  value?: ReactQuillType.Value;
  onChange?(value: string, delta: DeltaStatic, source: Sources, editor: ReactQuillType.UnprivilegedEditor): void;
};

function EditorFallback({ value = "", onChange }: FallbackProps) {
  return (
    <textarea
      className="min-h-52 w-full rounded-lg border border-gray-200 p-3 text-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-yellow-900 focus:ring-opacity-30"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange?.(
        event.target.value,
        {} as DeltaStatic,
        "user",
        {} as ReactQuillType.UnprivilegedEditor,
      )}
    />
  );
}

type ErrorBoundaryProps = FallbackProps & {
  children: ReactNode;
};

class QuillErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Quill editor failed to render:", error);
  }

  render() {
    if (this.state.hasError) {
      return <EditorFallback value={this.props.value} onChange={this.props.onChange} />;
    }

    return this.props.children;
  }
}
