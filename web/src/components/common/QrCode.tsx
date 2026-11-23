import { QRCodeSVG } from "qrcode.react"

type QrCodeProps = { value: string; size?: number; className?: string }

/** Renders `value` as a QR code (SVG, scannable by any phone camera). */
export function QrCode({ value, size = 192, className }: QrCodeProps) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      marginSize={2}
      level="M"
      // Fixed black on white, not theme tokens: scanners need maximum contrast in any preset or dark mode.
      bgColor="#ffffff"
      fgColor="#000000"
      role="img"
      aria-label="QR code"
      className={className}
    />
  )
}
