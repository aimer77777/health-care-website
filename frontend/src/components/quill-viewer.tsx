import "./quill.css"

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHtml(value: string, imageAlt: string, imageDescriptionId: string | undefined, newWindowText: string) {
  const normalized = value
    .replace(/<h([1-6])\b[^>]*>\s*(?:<br\s*\/?>(?:\s|&nbsp;)*)*<\/h\1>/gi, "")
    .replace(/<img\b(?![^>]*\balt=)([^>]*)>/gi, `<img alt="${escapeAttribute(imageAlt)}"$1>`)
    .replace(
      /<a\b((?=[^>]*\btarget=["']_blank["'])[^>]*)>([\s\S]*?)<\/a>/gi,
      (_match, attributes, content) => {
        const escapedText = escapeAttribute(newWindowText);
        const title = /\btitle=/i.test(attributes) ? "" : ` title="${escapedText}"`;
        return `<a${attributes}${title}>${content}<span class="sr-only">（${escapedText}）</span></a>`;
      }
    );

  if (!imageDescriptionId) return normalized;
  return normalized.replace(
    /<img\b(?![^>]*\baria-describedby=)([^>]*)>/gi,
    `<img aria-describedby="${escapeAttribute(imageDescriptionId)}"$1>`
  );
}

export default function QuillViewer({
  value,
  imageAlt = "內容圖片",
  imageDescriptionId,
  newWindowText = "另開新視窗",
}: {
  value: string;
  imageAlt?: string;
  imageDescriptionId?: string;
  newWindowText?: string;
}) {
  return (
    <section className="mt-6 ql-editor readable-content !p-0" dangerouslySetInnerHTML={{ __html: normalizeHtml(value, imageAlt, imageDescriptionId, newWindowText) }}></section>
  );
}
