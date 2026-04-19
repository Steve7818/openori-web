/**
 * Cloudflare Turnstile integration (invisible mode)
 */

export interface TurnstileWidget {
  execute: () => Promise<string>;
  reset: () => void;
  remove: () => void;
}

let turnstileLoaded = false;
let loadPromise: Promise<void> | null = null;

export function loadTurnstileScript(): Promise<void> {
  if (turnstileLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => {
      turnstileLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Turnstile'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function renderTurnstile(
  container: HTMLElement,
  siteKey: string
): Promise<TurnstileWidget> {
  return new Promise((resolve, reject) => {
    if (!window.turnstile) {
      reject(new Error('Turnstile not loaded'));
      return;
    }

    const widgetId = window.turnstile.render(container, {
      sitekey: siteKey,
      theme: 'light',
      size: 'invisible',
      callback: (token: string) => {
        // Token ready
      },
      'error-callback': () => {
        reject(new Error('Turnstile verification failed'));
      },
    });

    const widget: TurnstileWidget = {
      execute: () => {
        return new Promise((resolveToken, rejectToken) => {
          window.turnstile?.execute(container, {
            callback: resolveToken,
            'error-callback': rejectToken,
          });
        });
      },
      reset: () => window.turnstile?.reset(container),
      remove: () => window.turnstile?.remove(widgetId),
    };

    resolve(widget);
  });
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: any) => string;
      execute: (container: HTMLElement | string, options: any) => void;
      reset: (container: HTMLElement | string) => void;
      remove: (widgetId: string) => void;
    };
  }
}
