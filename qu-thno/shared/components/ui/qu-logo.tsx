const ASPECT_RATIO = 1003.8 / 525.2

interface QULogoProps {
  height?: number
  className?: string
}

export function QULogo({ height = 40, className }: QULogoProps) {
  const width = Math.round(height * ASPECT_RATIO)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/qu-logo.svg"
      alt="جامعة القصيم | Qassim University"
      width={width}
      height={height}
      className={className}
      style={{ height, width, objectFit: "contain" }}
    />
  )
}
