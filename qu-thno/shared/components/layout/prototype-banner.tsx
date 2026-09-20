interface Props {
  isRTL: boolean
}

// Calm, compact prototype disclosure — kept visible per design brief so the
// platform never reads as a finished, officially-launched service, but
// without the loud amber block the earlier version used.
export function PrototypeBanner({ isRTL }: Props) {
  return (
    <div className="w-full border-b border-slate-200 bg-slate-50 px-4 py-1.5 text-center text-xs text-slate-500">
      {isRTL
        ? "نموذج أوّلي للعرض والمناقشة — وليس خدمة رسمية منشورة"
        : "An initial prototype for demonstration and discussion — not a published official service"}
    </div>
  )
}
