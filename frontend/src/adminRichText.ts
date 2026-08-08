import { richTextToHtml, sanitizeRichTextHtml } from "./shared";

interface RichTextEditor {
  setValue: (value: string) => void;
  syncToTextarea: () => void;
}

const fontOptions = [
  ["", "Default"],
  ["Arial", "Arial"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times"],
  ["Oglavie, Georgia, serif", "Church"]
];

const sizeOptions = [
  ["", "Size"],
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
  ["P", "Paragraph"],
  ["H2", "Heading"],
  ["H3", "Subheading"],
  ["BLOCKQUOTE", "Quote"]
];

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

  const editor = document.createElement("div");
  editor.className = "rich-editable";
  editor.contentEditable = "true";
  editor.tabIndex = 0;
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  if (textarea.classList.contains("admin-large-textarea")) wrapper.classList.add("is-large");
  editor.innerHTML = richTextToHtml(textarea.value) || "<p><br></p>";

  let savedRange: Range | null = null;

  const saveSelection = (): void => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) savedRange = range.cloneRange();
  };

  const restoreSelection = (): void => {
    editor.focus();
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    if (savedRange) {
      selection.addRange(savedRange);
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
    savedRange = range.cloneRange();
  };

  const runCommand = (command: string, value?: string): void => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    syncToTextarea();
  };

  const makeButton = (label: string, title: string, command: string, value?: string): HTMLButtonElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => runCommand(command, value));
    return button;
  };

  const makeLinkButton = (): HTMLButtonElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Link";
    button.title = "Link";
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      restoreSelection();
      const url = window.prompt("Enter link");
      if (url) runCommand("createLink", url);
    });
    return button;
  };

  const fontSelect = makeSelect(fontOptions, "Font", (value) => {
    if (value) runCommand("fontName", value);
  });

  const sizeSelect = makeSelect(sizeOptions, "Font size", (value) => {
    if (!value) return;
    restoreSelection();
    document.execCommand("fontSize", false, "7");
    editor.querySelectorAll("font[size='7']").forEach((node) => {
      const element = node as HTMLElement;
      element.removeAttribute("size");
      element.style.fontSize = value;
    });
    saveSelection();
    syncToTextarea();
  });

  const blockSelect = makeSelect(blockOptions, "Style", (value) => {
    runCommand("formatBlock", value);
  });

  toolbar.append(
    fontSelect,
    sizeSelect,
    blockSelect,
    makeButton("B", "Bold", "bold"),
    makeButton("I", "Italic", "italic"),
    makeButton("U", "Underline", "underline"),
    makeButton("List", "Bullet list", "insertUnorderedList"),
    makeButton("1.", "Numbered list", "insertOrderedList"),
    makeButton("Left", "Align left", "justifyLeft"),
    makeButton("Center", "Align center", "justifyCenter"),
    makeButton("Right", "Align right", "justifyRight"),
    makeLinkButton(),
    makeButton("Clear", "Remove formatting", "removeFormat")
  );

  wrapper.append(toolbar, editor);
  textarea.hidden = true;
  textarea.insertAdjacentElement("beforebegin", wrapper);

  function syncToTextarea(): void {
    textarea.value = sanitizeRichTextHtml(editor.innerHTML).trim();
  }

  editor.addEventListener("mousedown", () => {
    if (!editor.innerHTML.trim()) editor.innerHTML = "<p><br></p>";
  });
  editor.addEventListener("focus", saveSelection);
  editor.addEventListener("mouseup", saveSelection);
  editor.addEventListener("keyup", saveSelection);
  editor.addEventListener("input", () => {
    saveSelection();
    syncToTextarea();
  });
  editor.addEventListener("blur", syncToTextarea);
  editor.addEventListener("paste", () => {
    window.setTimeout(() => {
      saveSelection();
      syncToTextarea();
    }, 0);
  });

  return {
    setValue(value: string): void {
      editor.innerHTML = richTextToHtml(value) || "<p><br></p>";
      savedRange = null;
      syncToTextarea();
    },
    syncToTextarea
  };
}
