"use server"

import { auth } from "@/core/auth/auth"
import { db } from "@/core/database/client"
import { uploadFile, deleteFile, generateStorageKey } from "./storage"

export type UploadResult = { success: true; documentId: string; url: string; nameAr: string } | { error: string }

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

// Generic file upload — stores the file in R2 and records it as a `Document`
// row linked polymorphically via (moduleRef, moduleId) to whatever entity
// it belongs to (e.g. a ProjectVisitRequest).
export async function uploadModuleFileAction(
  moduleRef: string,
  moduleId: string,
  formData: FormData,
): Promise<UploadResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { error: "يجب اختيار ملف" }
  if (file.size > MAX_FILE_SIZE) return { error: "حجم الملف يتجاوز الحد المسموح (20 ميجابايت)" }

  const key = generateStorageKey(moduleRef, moduleId, file.name)
  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadFile(key, buffer, file.type || "application/octet-stream")

  const doc = await db.document.create({
    data: {
      nameAr: file.name,
      type: file.type || "application/octet-stream",
      url,
      size: file.size,
      mimeType: file.type || null,
      moduleRef,
      moduleId,
      uploadedBy: session.user.id,
    },
  })

  return { success: true, documentId: doc.id, url, nameAr: doc.nameAr }
}

export async function getModuleFiles(moduleRef: string, moduleId: string) {
  return db.document.findMany({
    where: { moduleRef, moduleId },
    orderBy: { createdAt: "asc" },
  })
}

export async function deleteModuleFileAction(documentId: string): Promise<{ success: true } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "غير مصرح" }

  const doc = await db.document.findUnique({ where: { id: documentId } })
  if (!doc) return { error: "الملف غير موجود" }
  if (doc.uploadedBy !== session.user.id) return { error: "غير مصرح" }

  const publicUrlPrefix = process.env.R2_PUBLIC_URL ?? ""
  if (publicUrlPrefix && doc.url.startsWith(publicUrlPrefix)) {
    const key = doc.url.slice(publicUrlPrefix.length + 1)
    await deleteFile(key).catch(() => {})
  }

  await db.document.delete({ where: { id: documentId } })
  return { success: true }
}
