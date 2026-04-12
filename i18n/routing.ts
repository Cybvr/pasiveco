export { default as Link } from 'next/link'
export { redirect } from 'next/navigation'
export { usePathname, useRouter } from 'next/navigation'

export const routing = {
  locales: ['en'],
  defaultLocale: 'en',
} as const

export function getPathname(pathname: string) {
  return pathname
}
