interface ButtonFeedback {
  fail: (label?: string) => void;
  reset: () => void;
  start: (label?: string) => void;
  success: (label?: string) => void;
}

function restoreButton(button: HTMLButtonElement, originalText: string): void {
  button.disabled = false;
  button.textContent = originalText;
  button.classList.remove("is-saving", "is-success", "is-error");
}

export function buttonFeedback(event: Event, fallbackButton: HTMLButtonElement): ButtonFeedback {
  const submitter = event instanceof SubmitEvent && event.submitter instanceof HTMLButtonElement ? event.submitter : null;
  const button = submitter || fallbackButton;
  const originalText = button.dataset.defaultText || button.textContent || "Сохранить";
  button.dataset.defaultText = originalText;

  return {
    start(label = "Сохраняем..."): void {
      button.disabled = true;
      button.textContent = label;
      button.classList.remove("is-success", "is-error");
      button.classList.add("is-saving");
    },
    success(label = "Сохранено"): void {
      button.disabled = false;
      button.textContent = label;
      button.classList.remove("is-saving", "is-error");
      button.classList.add("is-success");
      window.setTimeout(() => restoreButton(button, originalText), 1800);
    },
    fail(label = "Не сохранено"): void {
      button.disabled = false;
      button.textContent = label;
      button.classList.remove("is-saving", "is-success");
      button.classList.add("is-error");
      window.setTimeout(() => restoreButton(button, originalText), 2400);
    },
    reset(): void {
      restoreButton(button, originalText);
    }
  };
}
