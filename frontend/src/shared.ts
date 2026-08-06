export function escapeHtml(value: unknown): string {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function paragraphsToHtml(text: unknown): string {
  return String(text || "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const allowedRichTextTags = new Set(["A", "B", "BLOCKQUOTE", "BR", "DIV", "EM", "FONT", "H2", "H3", "H4", "I", "LI", "OL", "P", "SPAN", "STRONG", "U", "UL"]);

function sanitizeStyle(value: string): string {
  return value
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => {
      const [property = "", rawValue = ""] = rule.split(":");
      const name = property.trim().toLowerCase();
      const styleValue = rawValue.trim();
      if (name === "text-align") return /^(left|center|right|justify)$/i.test(styleValue);
      if (name === "font-size") return /^([1-3]?[0-9](\.[0-9]+)?)(px|em|rem|%)$/i.test(styleValue);
      if (name === "font-family") return /^[a-z0-9\s"',.-]+$/i.test(styleValue);
      return false;
    })
    .join("; ");
}

export function sanitizeRichTextHtml(value: unknown): string {
  const source = String(value || "");
  if (!source) return "";

  const template = document.createElement("template");
  template.innerHTML = source;

  const cleanNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as HTMLElement;
    if (!allowedRichTextTags.has(element.tagName)) {
      const fragment = document.createDocumentFragment();
      element.childNodes.forEach((child) => {
        const cleaned = cleanNode(child);
        if (cleaned) fragment.appendChild(cleaned);
      });
      return fragment;
    }

    const cleaned = document.createElement(element.tagName.toLowerCase());
    if (element.tagName === "A") {
      const href = safePublicUrl(element.getAttribute("href"));
      if (href) {
        cleaned.setAttribute("href", href);
        cleaned.setAttribute("target", "_blank");
        cleaned.setAttribute("rel", "noopener");
      }
    }

    if (element.tagName === "FONT") {
      const face = element.getAttribute("face");
      if (face && /^[a-z0-9\s"',.-]+$/i.test(face)) cleaned.setAttribute("face", face);
    }

    const style = sanitizeStyle(element.getAttribute("style") || "");
    if (style) cleaned.setAttribute("style", style);

    element.childNodes.forEach((child) => {
      const childNode = cleanNode(child);
      if (childNode) cleaned.appendChild(childNode);
    });

    return cleaned;
  };

  const output = document.createElement("div");
  template.content.childNodes.forEach((node) => {
    const cleaned = cleanNode(node);
    if (cleaned) output.appendChild(cleaned);
  });

  return output.innerHTML;
}

export function richTextToHtml(value: unknown): string {
  const source = String(value || "").trim();
  if (!source) return "";
  if (/<[a-z][\s\S]*>/i.test(source)) return sanitizeRichTextHtml(source);
  return paragraphsToHtml(source);
}

export function safePublicUrl(value: unknown): string {
  if (!value) return "";

  try {
    const url = new URL(String(value), window.location.origin);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    if (url.protocol === "http:" && url.hostname !== window.location.hostname) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function formatPublicDate(value: unknown, language: string): string {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-GB" : language === "fr" ? "fr-FR" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${value}T00:00:00`));
  } catch {
    return String(value);
  }
}
