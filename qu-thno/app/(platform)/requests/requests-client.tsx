"use client"

import { useState } from "react"
import Link from "next/link"
import { Inbox } from "lucide-react"
import { BUCKET_LABEL, type RequestBucket, type UnifiedRequest } from "@/core/requests/types"

interface Props {
  requests: UnifiedRequest[]
  isRTL: boolean
}

const TYPE_ICON: Record<UnifiedRequest["type"], string> = {
  partnership: "🤝",
  event: "📅",
  consultation: "🎓",
  knowledge_exchange: "💡",
  project_visit: "🏗️",
}

export function RequestsClient({ requests, isRTL }: Props) {
  const [filter, setFilter] = useState<RequestBucket | "all">("all")
  const t = (ar: string, en: string) => (isRTL ? ar : en)

  const counts: Record<RequestBucket, number> = { new: 0, in_review: 0, on_hold: 0, completed: 0 }
  for (const r of requests) counts[r.bucket]++

  const filtered = filter === "all" ? requests : requests.filter((r) => r.bucket === filter)

  const tabs: { key: RequestBucket | "all"; label: string; count: number }[] = [
    { key: "all", label: t("الكل", "All"), count: requests.length },
    { key: "new", label: BUCKET_LABEL.new[isRTL ? "ar" : "en"], count: counts.new },
    { key: "in_review", label: BUCKET_LABEL.in_review[isRTL ? "ar" : "en"], count: counts.in_review },
    { key: "on_hold", label: BUCKET_LABEL.on_hold[isRTL ? "ar" : "en"], count: counts.on_hold },
    { key: "completed", label: BUCKET_LABEL.completed[isRTL ? "ar" : "en"], count: counts.completed },
  ]

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("الطلبات الواردة", "Incoming Requests")}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t(
            "جميع الطلبات الواردة من الجهات الخارجية والمستفيدين — شراكات، فعاليات، استشارات، وتبادل معرفي",
            "All incoming requests from external entities and beneficiaries — partnerships, events, consultations, and knowledge exchange",
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {tab.label} <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="size-8 mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("لا توجد طلبات", "No requests")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">{t("النوع", "Type")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("العنوان", "Title")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("الحالة", "Status")}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("التاريخ", "Date")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={`${r.type}-${r.id}`} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <span aria-hidden>{TYPE_ICON[r.type]}</span>
                      {isRTL ? r.typeLabelAr : r.typeLabelEn}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={r.href} className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
                      {isRTL ? r.titleAr : (r.titleEn ?? r.titleAr)}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${BUCKET_LABEL[r.bucket].className}`}>
                      {BUCKET_LABEL[r.bucket][isRTL ? "ar" : "en"]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
