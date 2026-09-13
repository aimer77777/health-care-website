import "./quill.css"

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHtml(value: string, imageAlt: string) {
  return value
    .replace(/<h([1-6])\b[^>]*>\s*(?:<br\s*\/?>(?:\s|&nbsp;)*)*<\/h\1>/gi, "")
    .replace(/<img\b(?![^>]*\balt=)([^>]*)>/gi, `<img alt="${escapeAttribute(imageAlt)}"$1>`);
}

export default function QuillViewer({
  value,
  imageAlt = "內容圖片",
}: {
  value: string;
  imageAlt?: string;
}) {
  return (
    <section className="mt-6 ql-editor !p-0" dangerouslySetInnerHTML={{ __html: normalizeHtml(value, imageAlt) }}></section>
  );
}
