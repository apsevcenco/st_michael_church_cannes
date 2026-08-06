import { richTextToHtml, sanitizeRichTextHtml } from "./shared";

interface RichTextEditor {
  setValue: (value: string) => void;
  syncToTextarea: () => void;
}

const fontOptions = [
  ["", "Обычный"],
  ["Arial", "Arial"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times"],
  ["Oglavie, Georgia, serif", "Церковный"]
];

const sizeOptions = [
  ["", "Размер"],
  ["13px", "13"],
  ["15px", "15"],
  ["17px", "17"],
  ["19px", "19"],
  ["22px", "22"],
  ["26px", "26"],
  ["30px", "30"],
  ["36px", "36"]
];

const blockOptions = [
  ["P", "Абзац"],
  ["H2", "Заголовок"],
  ["H3", "Подзаголовок"],
  ["BLOCKQUOTE", "Цитата"]
];

function makeButton(label: string, title: string, command: string, value?: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.title = title;
  button.addEventListener("click", () => {
    document.execCommand(command, false, value);
  });
  return button;
}

function makeLinkButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Link";
  button.title = "Ссылка";
  button.addEventListener("click", () => {
    const url = window.prompt("Введите ссылку");
    if (url) document.execCommand("createLink", false, url);
  });
  return button;
}

function makeSelect(options: string[][], title: string, onChange: (value: string) => void): HTMLSelectElement {
  const select = document.createElement("select");
  select.title = title;
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

export function createRichTextEditor(textarea: HTMLTextAreaElement): RichTextEditor {
  const wrapper = document.createElement("div");
  wrapper.className = "rich-editor";

  const toolbar = document.createElement("div");
  toolbar.className = "rich-toolbar";
  toolbar.addEventListener("mousedown", (event) => {
    if (event.target instanceof HTMLButtonElement) event.preventDefault();
  });

  const fontSelect = makeSelect(fontOptions, "Шрифт", (value) => {
    if (value) document.execCommand("fontName", false, value);
  });

  const editor = document.createElement("div");
  editor.className = "rich-editable";
  if (textarea.classList.contains("admin-large-textarea")) wrapper.classList.add("is-large");
  editor.contentEditable = "true";
  editor.innerHTML = richTextToHtml(textarea.value);

  const sizeSelect = makeSelect(sizeOptions, "Размер букв", (value) => {
    if (!value) return;
    document.execCommand("fontSize", false, "7");
    editor.querySelectorAll("font[size='7']").forEach((node) => {
      const element = node as HTMLElement;
      element.removeAttribute("size");
      element.style.fontSize = value;
    });
  });

  const blockSelect = makeSelect(blockOptions, "Стиль", (value) => {
    document.execCommand("formatBlock", false, value);
  });

  toolbar.append(
    fontSelect,
    sizeSelect,
    blockSelect,
    makeButton("B", "Жирный", "bold"),
    makeButton("I", "Курсив", "italic"),
    makeButton("U", "Подчеркнуть", "underline"),
    makeButton("List", "Маркированный список", "insertUnorderedList"),
    makeButton("1.", "Нумерованный список", "insertOrderedList"),
    makeButton("Left", "По левому краю", "justifyLeft"),
    makeButton("Center", "По центру", "justifyCenter"),
    makeButton("Right", "По правому краю", "justifyRight"),
    makeLinkButton(),
    makeButton("Clear", "Убрать формат", "removeFormat")
  );

  wrapper.append(toolbar, editor);
  textarea.hidden = true;
  textarea.insertAdjacentElement("beforebegin", wrapper);

  const syncToTextarea = (): void => {
    textarea.value = sanitizeRichTextHtml(editor.innerHTML).trim();
  };

  editor.addEventListener("input", syncToTextarea);
  editor.addEventListener("blur", syncToTextarea);
  editor.addEventListener("paste", () => {
    window.setTimeout(syncToTextarea, 0);
  });

  return {
    setValue(value: string): void {
      editor.innerHTML = richTextToHtml(value);
      syncToTextarea();
    },
    syncToTextarea
  };
}
