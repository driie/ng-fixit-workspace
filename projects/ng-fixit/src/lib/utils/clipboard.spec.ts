import { vi } from 'vitest';

import { writeClipboardText } from './clipboard';

describe('writeClipboardText', () => {
  it('writes text through the Clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const view = {
      navigator: {
        clipboard: { writeText },
      },
    } as unknown as Window;

    writeClipboardText(view, 'Report markdown');

    expect(writeText).toHaveBeenCalledWith('Report markdown');
    await expect(writeText.mock.results[0]?.value).resolves.toBeUndefined();
  });

  it('no-ops when the view is missing', () => {
    expect(() => {
      writeClipboardText(null, 'Report markdown');
    }).not.toThrow();
  });

  it('no-ops when the Clipboard API is missing', () => {
    const view = {
      navigator: {},
    } as Window;

    expect(() => {
      writeClipboardText(view, 'Report markdown');
    }).not.toThrow();
  });

  it('swallows Clipboard write rejections', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
    const view = {
      navigator: {
        clipboard: { writeText },
      },
    } as unknown as Window;

    expect(() => {
      writeClipboardText(view, 'Report markdown');
    }).not.toThrow();

    await expect(writeText.mock.results[0]?.value).rejects.toThrow('permission denied');
  });
});
