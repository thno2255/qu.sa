"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { requestProjectVisitAction } from "@/core/project-visits/actions"
import {
  ChevronRight, CheckCircle2, Loader2, Briefcase, Paperclip, MapPin,
} from "lucide-react"

interface Faculty {
  id: string
  nameAr: string | null
  name: string | null
  email: string
  jobTitle: string | null
  userType: string
}

const USER_TYPE_LABEL: Record<string, string> = {
  FACULTY_MEMBER:  "عضو هيئة التدريس",
  DEPARTMENT_HEAD: "رئيس القسم",
  COLLEGE_DEAN:    "عميد الكلية",
}

interface Props {
  facultyList: Faculty[]
  preselectedId?: string
}

export function ProjectVisitForm({ facultyList, preselectedId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(preselectedId ? 2 : 1)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(
    preselectedId ? (facultyList.find(f => f.id === preselectedId) ?? null) : null,
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [files, setFiles] = useState<File[]>([])

  const [state, formAction, isPending] = useActionState(requestProjectVisitAction, null)

  const filteredFaculty = facultyList.filter(f => {
    const q = searchQuery.toLowerCase()
    return (
      !q ||
      (f.nameAr ?? "").toLowerCase().includes(q) ||
      (f.name ?? "").toLowerCase().includes(q) ||
      (f.jobTitle ?? "").toLowerCase().includes(q)
    )
  })

  if (state && "success" in state && state.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center" dir="rtl">
        <div className="flex size-20 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="size-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          سيصلك إشعار عند رد العضو المكلّف على طلب الزيارة الميدانية.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/consultations/project-visits/${state.id}`)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            عرض الطلب
          </button>
          <button
            onClick={() => router.push("/consultations/project-visits")}
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
      {/* Progress steps */}
      <div className="mb-8 flex items-center gap-2">
        {[
          { n: 1, label: "اختر العضو" },
          { n: 2, label: "تفاصيل المشروع والملفات" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step === s.n ? "bg-primary text-primary-foreground" : step > s.n ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.n ? <CheckCircle2 className="size-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium truncate ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < 1 && <div className={`h-px flex-1 transition-colors ${step > s.n ? "bg-green-400" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Faculty selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">اختر عضو هيئة التدريس</h2>
            <p className="mt-1 text-sm text-muted-foreground">اختر العضو المسؤول عن مراجعة مشروعك</p>
          </div>

          <input
            type="text"
            placeholder="ابحث بالاسم أو التخصص..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="space-y-2 max-h-[420px] overflow-y-auto rounded-xl">
            {filteredFaculty.map(f => {
              const isSelected = selectedFaculty?.id === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFaculty(f)}
                  className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-start transition-all hover:border-primary/50 ${
                    isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"
                  }`}
                >
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-colors ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {(f.nameAr ?? f.name ?? f.email).charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{f.nameAr ?? f.name}</p>
                    <p className="text-xs text-muted-foreground">{USER_TYPE_LABEL[f.userType] ?? f.userType}</p>
                    {f.jobTitle && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Briefcase className="size-3" />
                        {f.jobTitle}
                      </div>
                    )}
                  </div>
                  {isSelected && <CheckCircle2 className="size-5 shrink-0 text-primary" />}
                </button>
              )
            })}
            {filteredFaculty.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة</div>
            )}
          </div>

          <button
            disabled={!selectedFaculty}
            onClick={() => setStep(2)}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            التالي — تفاصيل المشروع
          </button>
        </div>
      )}

      {/* Step 2: Details + files */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">تفاصيل المشروع</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              إلى: <span className="font-medium text-foreground">{selectedFaculty?.nameAr ?? selectedFaculty?.name}</span>
            </p>
          </div>

          {state && "error" in state && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{state.error}</div>
          )}

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="facultyId" value={selectedFaculty?.id ?? ""} />

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

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ChevronRight className="size-4" />
                رجوع
              </button>
              <button
                type="submit"
                disabled={isPending || files.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> جاري الإرسال...</>
                ) : (
                  <><Paperclip className="size-4" /> إرسال طلب الزيارة</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
