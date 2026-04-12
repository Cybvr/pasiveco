
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || typeof window === 'undefined') {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => { })
        })
      })
      .catch(() => { })

    return
  }

  if ('serviceWorker' in navigator && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('ServiceWorker registered'))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    });
  }
}
