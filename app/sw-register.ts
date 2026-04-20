
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
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => console.log('ServiceWorker registered'))
        .catch(err => console.log('ServiceWorker registration failed:', err))
    }

    if (document.readyState === 'complete') {
      register()
      return
    }

    window.addEventListener('load', register, { once: true })
  }
}
