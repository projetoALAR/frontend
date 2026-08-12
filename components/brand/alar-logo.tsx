import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

type AlarLogoProps = {
  /** Só o ícone ou ícone + nome */
  variant?: "mark" | "full"
  /** Tamanho do ícone em pixels */
  size?: "sm" | "md" | "lg"
  /** Envolve em link para a home */
  href?: string
  className?: string
  /** Oculta o texto "Alar" mesmo em variant full */
  hideText?: boolean
}

const iconSizes = {
  sm: 28,
  md: 32,
  lg: 40,
} as const

const textSizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
} as const

export function AlarLogo({
  variant = "full",
  size = "md",
  href,
  className,
  hideText = false,
}: AlarLogoProps) {
  const px = iconSizes[size]
  const showText = variant === "full" && !hideText

  const content = (
    <div
      className={cn(
        "flex items-center gap-2.5 group",
        href && "cursor-pointer",
        className,
      )}
    >
      <Image
        src="/logo-mark.svg"
        alt=""
        width={px}
        height={px}
        className={cn("shrink-0 transition-transform duration-300", href && "group-hover:scale-105")}
        aria-hidden
        priority
      />
      {showText ? (
        <span className={cn("font-bold text-foreground tracking-tight", textSizes[size])}>
          Alar
        </span>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    )
  }

  return content
}
