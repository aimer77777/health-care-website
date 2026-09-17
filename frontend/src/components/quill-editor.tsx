"use client";

import "./quill.css";
import type QuillType from "quill";
import type { DeltaStatic, Sources } from "quill";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageRepoImpl from "@/module/image/presenter/imageRepoImpl";
import ImageUsecase from "@/module/image/application/imageUsecase";
import ImageViewModel from "@/module/image/presenter/imageViewModel";

type QuillValue = string | DeltaStatic;

type Props = {
  className?: string;
  label?: string;
  value?: QuillValue;
  onChange?(value: string, delta: DeltaStatic, source: Sources, editor: QuillType): void;
};

export default function QuillEditor({
  className,
  label,
  value,
  onChange,
}: Props) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillType | null>(null);
  const isInitializingRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const lastHtmlRef = useRef<string>("");

  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [hasEditorError, setHasEditorError] = useState<boolean>(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const uploadAndInsertImages = useCallback(async (files: File[], index?: number) => {
    const editor = quillRef.current;
    if (!editor || files.length === 0) return;

    const usecase = new ImageUsecase(new ImageRepoImpl());
    let insertIndex = index ?? editor.getSelection()?.index ?? editor.getLength();

    for (const file of files) {
      try {
        const image = await usecase.uploadImage(file);
        const vm = new ImageViewModel(image);
        editor.insertEmbed(insertIndex, "image", vm.url, "user");
        editor.insertText(insertIndex + 1, "\n", "user");
        insertIndex += 2;
        editor.setSelection(insertIndex, 0, "silent");
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }
  }, []);

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
        image: function () {
          const fileInput = document.createElement("input");
          fileInput.setAttribute("type", "file");
          fileInput.setAttribute("accept", "image/*");
          fileInput.click();

          fileInput.onchange = () => {
            const file = fileInput.files?.item(0);
            if (!file) return;

            const editor = quillRef.current;
            void uploadAndInsertImages([file], editor?.getSelection()?.index);
          };
        },
      },
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  }), [uploadAndInsertImages]);

  useEffect(() => {
    if (!editorContainerRef.current || quillRef.current || isInitializingRef.current) return;

    let isDisposed = false;
    isInitializingRef.current = true;

    async function initializeEditor() {
      try {
        const quillModule = await import("quill");
        const Quill = (quillModule.default ?? quillModule) as typeof QuillType;

        try {
          const imageResizeModule = await import("quill-image-resize-module-ts");
          if (!(Quill as any).imports?.["modules/imageResize"]) {
            Quill.register("modules/imageResize", imageResizeModule.ImageResize);
          }
        } catch (err) {
          console.warn("Quill image resize module failed to load:", err);
        }

        if (isDisposed || !editorContainerRef.current) return;

        const editor = new Quill(editorContainerRef.current, {
          theme: "snow",
          modules,
        });

        quillRef.current = editor;
        isInitializingRef.current = false;
        setHasEditorError(false);

        const initialHtml = valueToHtml(valueRef.current);
        if (initialHtml) {
          editor.clipboard.dangerouslyPasteHTML(initialHtml, "silent");
        }
        lastHtmlRef.current = editor.root.innerHTML;

        editor.on("text-change", (delta: DeltaStatic, _oldDelta: DeltaStatic, source: Sources) => {
          const html = editor.root.innerHTML;
          lastHtmlRef.current = html;
          onChangeRef.current?.(html, delta, source, editor);
        });

        editor.on("selection-change", (range) => {
          setIsFocus(range !== null);
        });
      } catch (err) {
        console.error("Quill editor failed to initialize:", err);
        isInitializingRef.current = false;
        setHasEditorError(true);
      }
    }

    void initializeEditor();

    return () => {
      isDisposed = true;
      isInitializingRef.current = false;
      quillRef.current = null;
    };
  }, [modules]);

  useEffect(() => {
    const editor = quillRef.current;
    if (!editor) return;

    const nextHtml = valueToHtml(value);
    if (nextHtml === lastHtmlRef.current) return;

    const range = editor.getSelection();
    editor.clipboard.dangerouslyPasteHTML(nextHtml, "silent");
    lastHtmlRef.current = editor.root.innerHTML;
    if (range) editor.setSelection(range, "silent");
  }, [value]);

  const handlePasteCapture = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const files = getImageFilesFromDataTransfer(event.clipboardData);
    if (files.length === 0) return;

    const editor = quillRef.current;
    if (!editor) return;

    event.preventDefault();
    event.stopPropagation();
    void uploadAndInsertImages(files, editor.getSelection()?.index ?? editor.getLength());
  }, [uploadAndInsertImages]);

  const handleDragOverCapture = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (getImageFilesFromDataTransfer(event.dataTransfer).length === 0) return;

    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDropCapture = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    const files = getImageFilesFromDataTransfer(event.dataTransfer);
    if (files.length === 0) return;

    const editor = quillRef.current;
    if (!editor) return;

    event.preventDefault();
    event.stopPropagation();
    void uploadAndInsertImages(files, editor.getSelection()?.index ?? editor.getLength());
  }, [uploadAndInsertImages]);

  return (
    <div
      className={`${className ?? ""} w-full`}
      onPasteCapture={handlePasteCapture}
      onDragOverCapture={handleDragOverCapture}
      onDropCapture={handleDropCapture}
    >
      {label && <label htmlFor={label} className="label">{label}</label>}
      {
        hasEditorError
          ? <EditorFallback value={value} onChange={onChange} />
          : <div
              ref={editorContainerRef}
              className={`min-h-52 w-full text-lg rounded-lg outline-none transition-all duration-200
                ${isFocus ? "ring-opacity-30 ring-yellow-900 ring-2" : "ring-gray-200 ring-1"}`}
            />
      }
    </div>
  );
}

function valueToHtml(value?: QuillValue) {
  return typeof value === "string" ? value : "";
}

function getImageFilesFromDataTransfer(data?: DataTransfer | null) {
  const filesFromItems = getImageFilesFromItems(data?.items);
  return filesFromItems.length > 0 ? filesFromItems : getImageFilesFromList(data?.files);
}

function getImageFilesFromItems(items?: DataTransferItemList | null) {
  if (!items) return [];

  return Array.from(items)
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);
}

function getImageFilesFromList(fileList?: FileList | null) {
  if (!fileList) return [];

  return Array.from(fileList).filter((file) => file.type.startsWith("image/"));
}

type FallbackProps = {
  value?: QuillValue;
  onChange?(value: string, delta: DeltaStatic, source: Sources, editor: QuillType): void;
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
        {} as QuillType,
      )}
    />
  );
}
