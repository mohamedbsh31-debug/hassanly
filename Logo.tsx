import Link from 'next/link'

interface LogoProps {
  className?: string
  linkClassName?: string
  href?: string
}

export function Logo({ className, linkClassName, href = '/' }: LogoProps) {
  return (
    <Link href={href} className={linkClassName}>
      <span className={`font-bold text-xl tracking-tight ${className ?? ''}`}>
        hassanly
      </span>
    </Link>
  )
}
