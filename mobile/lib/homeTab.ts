/** Ask the home screen to show its opening page again. */
const listeners = new Set<() => void>();

export function requestHomePage() {
  listeners.forEach((listener) => listener());
}

export function subscribeHomePage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
