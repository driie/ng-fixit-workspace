export const writeClipboardText = (view: Window | null | undefined, text: string): void => {
  const clipboard = view?.navigator.clipboard;
  if (!clipboard) {
    return;
  }

  void clipboard.writeText(text).catch(() => undefined);
};
