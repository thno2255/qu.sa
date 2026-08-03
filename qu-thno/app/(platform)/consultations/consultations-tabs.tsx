"use client"

import { useState, type ReactNode } from "react"
import { GraduationCap, MapPin } from "lucide-react"

type TabKey = "consultations" | "visits"

interface Props {
  defaultTab: TabKey
  consultationsContent: ReactNode
  visitsContent: ReactNode
}

export function ConsultationsTabs({ defaultTab, consultationsContent, visitsContent }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab)

  return (
    <div className="space-y-6">
      <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setTab("consultations")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "consultations"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="size-4" />
          الاستشارات الأكاديمية
        </button>
        <button
          onClick={() => setTab("visits")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === "visits"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin className="size-4" />
          المشاريع والزيارات الميدانية
        </button>
      </div>

      {tab === "consultations" ? consultationsContent : visitsContent}
    </div>
  )
}
