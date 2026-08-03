"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { requestProjectVisitAction } from "@/core/project-visits/actions"
import {
  CheckCircle2, Loader2, Paperclip, MapPin,
} from "lucide-react"

export function ProjectVisitForm() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])

  const [state, formAction, isPending] = useActionState(requestProjectVisitAction, null)

  if (state && "success" in state && state.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          سيراجع فريق المسؤولية المجتمعية طلبك ويعيّن لك عضو هيئة تدريس مناسب قريباً. سيصلك إشعار فور التعيين.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/consultations/project-visits/${state.id}`)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            عرض الطلب
          </button>
          <button
            onClick={() => router.push("/consultations?tab=visits")}
            className="rounded-xl border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            الرجوع للقائمة
          </button>
        </div>
      </div>
    )
  }

  function handleFilesChange(list: FileList | null) {
    setFiles(list ? Array.from(list) : [])
  }

  return (
    <div className="mx-auto max-w-2xl" dir="rtl">
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">تفاصيل المشروع</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            سيراجع فريق المسؤولية المجتمعية طلبك ويعيّن عضو هيئة التدريس المناسب لمراجعة مشروعك
          </p>
        </div>

        {state && "error" in state && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{state.error}</div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              عنوان المشروع <span className="text-red-500">*</span>
            </label>
            <input
              name="projectTitleAr"
              required
              maxLength={150}
              placeholder="مثال: مبادرة تدوير النفايات — حي الصفراء"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              وصف المشروع <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descriptionAr"
              required
              rows={5}
              placeholder="اشرح تفاصيل المشروع والغرض من الزيارة الميدانية..."
              className="w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MapPin className="size-3.5" />
              موقع المشروع <span className="text-muted-foreground text-xs">(اختياري)</span>
            </label>
            <input
              name="locationAr"
              placeholder="مثال: بريدة — حي الصفراء"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Paperclip className="size-3.5" />
              ملفات المشروع <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
              <input
                id="visit-files"
                name="files"
                type="file"
                multiple
                required
                className="hidden"
                onChange={e => handleFilesChange(e.target.files)}
              />
              <label htmlFor="visit-files" className="cursor-pointer text-sm text-primary hover:underline">
                اختر ملفات المشروع للإرفاق
              </label>
              <p className="mt-1 text-xs text-muted-foreground">حتى 20 ميجابايت لكل ملف</p>
            </div>

            {files.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
                    <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{f.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending || files.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <><Loader2 className="size-4 animate-spin" /> جاري الإرسال...</>
            ) : (
              <><Paperclip className="size-4" /> إرسال طلب الزيارة</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
