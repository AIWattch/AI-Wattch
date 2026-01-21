function debounce<F extends (...args: any[]) => void>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default debounce;

export function debounceAsync<F extends (...args: any[]) => Promise<any>>(
  func: F,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let pendingResolve: ((value: Awaited<ReturnType<F>> | void) => void) | null =
    null;

  return (...args: Parameters<F>): Promise<Awaited<ReturnType<F>> | void> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
        pendingResolve?.(); // cancel previous
      }
      pendingResolve = resolve;
      timeout = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
        timeout = null;
        pendingResolve = null;
      }, wait);
    });
}
