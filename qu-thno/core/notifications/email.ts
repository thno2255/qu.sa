import { db } from "@/core/database/client"
import type { SendEmailParams } from "./types"

// ---------------------------------------------------------------------------
// Email transport — console in dev, extend here for production SMTP
// ---------------------------------------------------------------------------

export async function queueEmail(params: SendEmailParams): Promise<void> {
  // Always record in the EmailQueue table for history and audit
  await db.emailQueue.create({
    data: {
      recipientEmail: params.to,
      recipientName: params.toName ?? null,
      subject: params.subject,
      bodyHtml: params.bodyHtml,
      bodyText: params.bodyText ?? null,
      notificationId: params.notificationId ?? null,
      status: "QUEUED",
    },
  })

  if (process.env.NODE_ENV === "development") {
    // Print to terminal — no SMTP server needed in dev
    console.log("\n📧 ─────────────────────────────────────────────────────────")
    console.log(`To:      ${params.toName ? `${params.toName} <${params.to}>` : params.to}`)
    console.log(`Subject: ${params.subject}`)
    console.log(`Body:    ${params.bodyText ?? stripHtml(params.bodyHtml)}`)
    console.log("─────────────────────────────────────────────────────────────\n")
    return
  }

  // Production: swap this with Nodemailer / Resend / Unifonic
  // e.g. await resend.emails.send({ from: "noreply@qu.edu.sa", to: params.to, ... })
  // For now: mark as sent immediately (no actual SMTP)
  await db.emailQueue.updateMany({
    where: { recipientEmail: params.to, status: "QUEUED" },
    data: { status: "SENT", sentAt: new Date() },
  })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
}

// ---------------------------------------------------------------------------
// Build a standard notification email body
// ---------------------------------------------------------------------------

export function buildNotificationEmail(params: {
  titleAr: string
  bodyAr: string
  titleEn?: string
  bodyEn?: string
  ctaUrl?: string
  ctaLabelAr?: string
}): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = params.titleAr

  const bodyHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px">
        <!-- Header -->
        <tr><td style="background:#16a34a;padding:20px 32px">
          <span style="color:#fff;font-size:18px;font-weight:bold">منصة المسؤولية المجتمعية</span>
          <span style="color:#ffffff80;font-size:12px;display:block;margin-top:2px">جامعة القصيم</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="color:#111;margin:0 0 16px;font-size:18px">${params.titleAr}</h2>
          <p style="color:#444;line-height:1.7;margin:0 0 24px;font-size:14px">${params.bodyAr}</p>
          ${params.ctaUrl ? `
          <a href="${params.ctaUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
            ${params.ctaLabelAr ?? "عرض التفاصيل"}
          </a>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee">
          <p style="color:#888;font-size:11px;margin:0;text-align:center">
            هذه الرسالة أُرسلت تلقائياً من منصة المسؤولية المجتمعية — جامعة القصيم
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const bodyText = `${params.titleAr}\n\n${params.bodyAr}${params.ctaUrl ? `\n\nعرض التفاصيل: ${params.ctaUrl}` : ""}`

  return { subject, bodyHtml, bodyText }
}
