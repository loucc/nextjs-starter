// Minimal typings for the Cloudflare Turnstile global (loaded via
// https://challenges.cloudflare.com/turnstile/v0/api.js).
interface Window {
  turnstile: {
    render(
      container: HTMLElement,
      options: Record<string, unknown>
    ): string;
    reset(widgetId?: string): void;
    remove(widgetId: string): void;
  };
}
