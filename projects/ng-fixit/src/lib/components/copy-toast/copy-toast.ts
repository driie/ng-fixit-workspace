import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import { AnnotationSessionStore } from '../../services/annotation-session-store';

export const COPY_TOAST_DURATION_MS = 5000;

@Component({
  selector: 'fixit-copy-toast',
  templateUrl: './copy-toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fixit-copy-toast',
    role: 'status',
    'aria-live': 'polite',
    'data-fixit-chrome': '',
    'data-testid': 'fixit-copy-toast',
    '[attr.hidden]': 'visible() ? null : ""',
    '(mouseenter)': 'pauseAutoClose()',
    '(mouseleave)': 'resumeAutoClose()',
  },
})
export class CopyToast {
  private readonly annotationSessionStore = inject(AnnotationSessionStore);
  private readonly destroyRef = inject(DestroyRef);

  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
  private autoCloseStartedAt = 0;
  private autoCloseRemainingMs = COPY_TOAST_DURATION_MS;

  protected readonly visible = signal<boolean>(false);

  show(): void {
    this.visible.set(true);
    this.autoCloseRemainingMs = COPY_TOAST_DURATION_MS;
    this.startAutoCloseTimer();
  }

  dismiss(): void {
    this.visible.set(false);
    this.clearAutoCloseTimer();
    this.autoCloseRemainingMs = COPY_TOAST_DURATION_MS;
  }

  clearAnnotations(): void {
    this.annotationSessionStore.clearAnnotations();
  }

  pauseAutoClose(): void {
    if (!this.visible() || this.autoCloseTimer === null) {
      return;
    }

    const elapsedMs = Date.now() - this.autoCloseStartedAt;
    this.autoCloseRemainingMs = Math.max(0, this.autoCloseRemainingMs - elapsedMs);
    this.clearAutoCloseTimer();
  }

  resumeAutoClose(): void {
    if (!this.visible() || this.autoCloseTimer !== null) {
      return;
    }

    this.startAutoCloseTimer();
  }

  private startAutoCloseTimer(): void {
    this.clearAutoCloseTimer();
    this.autoCloseStartedAt = Date.now();
    this.autoCloseTimer = setTimeout(() => {
      this.autoCloseTimer = null;
      this.dismiss();
    }, this.autoCloseRemainingMs);
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer === null) {
      return;
    }

    clearTimeout(this.autoCloseTimer);
    this.autoCloseTimer = null;
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearAutoCloseTimer();
    });
  }
}
