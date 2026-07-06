"use client"

import { useState, useTransition, useActionState } from "react"
import { UserPlus, Trash2, Users, CheckCircle2, Clock, XCircle, X, RotateCcw, Pencil } from "lucide-react"
import {
  createUserAction,
  editUserAction,
  deactivateUserAction,
  reactivateUserAction,
  changeUserRoleAction,
} from "@/core/iam/actions"

const USER_TYPE_LABEL: Record<string, string> = {
  SYSTEM_ADMIN:       "مدير النظام",
  COMMUNITY_MANAGER:  "مدير المسؤولية المجتمعية",
  COMMUNITY_EMPLOYEE: "موظف المسؤولية المجتمعية",
  COLLEGE_DEAN:       "عميد الكلية",
  DEPARTMENT_HEAD:    "رئيس القسم",
  FACULTY_MEMBER:     "عضو هيئة التدريس",
  STUDENT:            "طالب",
  EXTERNAL_ENTITY:    "جهة خارجية",
  VOLUNTEER:          "متطوع",
  VISITOR:            "زائر",
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:      "bg-green-100 text-green-700",
  PENDING:     "bg-amber-100 text-amber-700",
  SUSPENDED:   "bg-red-100 text-red-700",
  DEACTIVATED: "bg-gray-100 text-gray-500",
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:      "نشط",
  PENDING:     "قيد المراجعة",
  SUSPENDED:   "موقوف",
  DEACTIVATED: "معطّل",
}

interface UserRow {
  id: string
  name: string | null
  nameAr: string | null
  email: string
  userType: string
  status: string
  jobTitle: string | null
  createdAt: Date
  lastLoginAt: Date | null
}

interface Props {
  users: UserRow[]
  total: number
  active: number
  pending: number
  suspended: number
  currentUserId: string
  isSystemAdmin: boolean
}

export function UsersClient({
  users,
  total,
  active,
  pending,
  suspended,
  currentUserId,
  isSystemAdmin,
}: Props) {
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [editingUser,   setEditingUser]   = useState<UserRow | null>(null)
  const [isPending,     startTransition]  = useTransition()
  const [addState,      addAction]        = useActionState(createUserAction, null)
  const [editState,     editAction]       = useActionState(editUserAction, null)
  const [busyId,        setBusyId]        = useState<string | null>(null)

  const handleDeactivate = (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من تعطيل حساب "${userName}"؟`)) return
    setBusyId(userId)
    startTransition(async () => {
      const res = await deactivateUserAction(userId)
      if ("error" in res) alert(res.error)
      setBusyId(null)
    })
  }

  const handleReactivate = (userId: string) => {
    setBusyId(userId)
    startTransition(async () => {
      const res = await reactivateUserAction(userId)
      if ("error" in res) alert(res.error)
      setBusyId(null)
    })
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    setBusyId(userId)
    startTransition(async () => {
      const res = await changeUserRoleAction(userId, newRole)
      if ("error" in res) alert(res.error)
      setBusyId(null)
    })
  }

  // Close edit modal on success
  if (editState && "success" in editState && editingUser) {
    setEditingUser(null)
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="mt-1 text-sm text-muted-foreground">مراجعة وإدارة مستخدمي المنصة</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="size-4" />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(
          [
            { label: "إجمالي المستخدمين", value: total,     Icon: Users,        color: "bg-blue-500/10 text-blue-600" },
            { label: "نشط",               value: active,    Icon: CheckCircle2, color: "bg-green-500/10 text-green-600" },
            { label: "قيد المراجعة",      value: pending,   Icon: Clock,        color: "bg-amber-500/10 text-amber-600" },
            { label: "موقوف / معطّل",     value: suspended, Icon: XCircle,      color: "bg-red-500/10 text-red-600" },
          ] as const
        ).map((s, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.Icon className="size-5" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">جميع المستخدمين ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-5 py-3 text-start font-medium text-muted-foreground">المستخدم</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">المهنة</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">الدور</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">الحالة</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">آخر دخول</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf      = u.id === currentUserId
                const isBusy      = busyId === u.id
                const displayName = u.nameAr ?? u.name ?? u.email

                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">

                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {displayName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {displayName}
                            {isSelf && <span className="me-1 text-xs text-muted-foreground">(أنت)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job title */}
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {u.jobTitle ?? <span className="text-muted-foreground/40">—</span>}
                    </td>

                    {/* Role select */}
                    <td className="px-4 py-4">
                      <select
                        defaultValue={u.userType}
                        disabled={isSelf || isBusy}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="rounded-md border bg-background px-2 py-1.5 text-xs text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {Object.entries(USER_TYPE_LABEL).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[u.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABEL[u.status] ?? u.status}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString("ar-SA")
                        : "لم يسجّل دخوله"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Edit button — available to SYSTEM_ADMIN and COMMUNITY_MANAGER */}
                        <button
                          onClick={() => setEditingUser(u)}
                          disabled={isBusy}
                          title="تعديل الاسم والمهنة"
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                        >
                          <Pencil className="size-3.5" />
                          تعديل
                        </button>

                        {/* Deactivate / Reactivate — SYSTEM_ADMIN only, not self */}
                        {!isSelf && isSystemAdmin && (
                          u.status === "DEACTIVATED" ? (
                            <button
                              onClick={() => handleReactivate(u.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                              <RotateCcw className="size-3.5" />
                              تفعيل
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivate(u.id, displayName)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="size-3.5" />
                              تعطيل
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-background shadow-xl" dir="rtl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-foreground">إضافة مستخدم جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <form action={addAction} className="space-y-4 p-5">
              {addState && "error" in addState && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{addState.error}</div>
              )}
              {addState && "success" in addState && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">تم إضافة المستخدم بنجاح</div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">الاسم بالعربي <span className="text-red-500">*</span></label>
                <input name="nameAr" required placeholder="مثال: أحمد محمد العمري"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">البريد الإلكتروني <span className="text-red-500">*</span></label>
                <input name="email" type="email" required dir="ltr" placeholder="user@qu.edu.sa"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">كلمة المرور <span className="text-red-500">*</span></label>
                <input name="password" type="password" required dir="ltr" placeholder="8 أحرف على الأقل"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">الدور <span className="text-red-500">*</span></label>
                <select name="userType" required
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {Object.entries(USER_TYPE_LABEL).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">إضافة المستخدم</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setEditingUser(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-background shadow-xl" dir="rtl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold text-foreground">تعديل بيانات المستخدم</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <form action={editAction} className="space-y-4 p-5">
              <input type="hidden" name="userId" value={editingUser.id} />

              {editState && "error" in editState && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{editState.error}</div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  الاسم بالعربي <span className="text-red-500">*</span>
                </label>
                <input
                  name="nameAr"
                  required
                  defaultValue={editingUser.nameAr ?? ""}
                  placeholder="الاسم بالعربي"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  الاسم بالإنجليزي <span className="text-muted-foreground text-xs">(اختياري)</span>
                </label>
                <input
                  name="name"
                  dir="ltr"
                  defaultValue={editingUser.name ?? ""}
                  placeholder="English Name"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  المهنة / المسمى الوظيفي <span className="text-muted-foreground text-xs">(اختياري)</span>
                </label>
                <input
                  name="jobTitle"
                  defaultValue={editingUser.jobTitle ?? ""}
                  placeholder="مثال: أستاذ مشارك — قسم علوم الحاسب"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  حفظ التغييرات
                </button>
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-muted transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
