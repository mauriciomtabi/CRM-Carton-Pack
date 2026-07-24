export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const toastService = {
  show(message: string, type: ToastType = 'info') {
    const event = new CustomEvent('cp-toast-add', { detail: { message, type } });
    window.dispatchEvent(event);
  },
  success(message: string) {
    this.show(message, 'success');
  },
  warning(message: string) {
    this.show(message, 'warning');
  },
  error(message: string) {
    this.show(message, 'error');
  },
  info(message: string) {
    this.show(message, 'info');
  }
};
