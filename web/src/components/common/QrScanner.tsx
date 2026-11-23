import { Scanner } from "@yudiel/react-qr-scanner"

type QrScannerProps = { onScan: (value: string) => void; className?: string }

/** Camera QR scanner: calls `onScan` with the decoded text of the first code found. */
export function QrScanner({ onScan, className }: QrScannerProps) {
  return (
    <div className={className}>
      <Scanner
        onScan={(codes) => {
          const value = codes[0]?.rawValue
          if (value) onScan(value)
        }}
        constraints={{ facingMode: "environment" }}
        sound={false}
      />
    </div>
  )
}
