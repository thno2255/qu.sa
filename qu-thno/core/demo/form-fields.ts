// Field definitions mirroring the real forms' field sets (see the forms
// under app/(platform)/initiatives, app/(public)/partners/apply,
// app/(platform)/consultations/new, app/(public)/events/new) so the demo
// collects the same information, just saved into the standalone
// DemoRequest table instead of the real domain tables.
export type DemoFieldType = "text" | "textarea" | "date" | "number" | "url" | "email" | "tel" | "select" | "multiselect"

export interface DemoField {
  name: string
  label: string
  type: DemoFieldType
  required?: boolean
  maxLength?: number
  placeholder?: string
  options?: { value: string; label: string }[]
}

export const SDG_LABELS: Record<number, string> = {
  1: "القضاء على الفقر", 2: "القضاء على الجوع", 3: "الصحة الجيدة والرفاه",
  4: "التعليم الجيد", 5: "المساواة بين الجنسين", 6: "المياه النظيفة والنظافة الصحية",
  7: "طاقة نظيفة وبأسعار معقولة", 8: "العمل اللائق ونمو الاقتصاد", 9: "الصناعة والابتكار والهياكل الأساسية",
  10: "الحد من أوجه عدم المساواة", 11: "مدن ومجتمعات محلية مستدامة", 12: "الاستهلاك والإنتاج المسؤولان",
  13: "العمل المناخي", 14: "الحياة تحت الماء", 15: "الحياة في البر",
  16: "السلام والعدل والمؤسسات القوية", 17: "عقد الشراكات لتحقيق الأهداف",
}

export const DEMO_FORM_FIELDS: Record<string, DemoField[]> = {
  initiatives: [
    { name: "titleAr", label: "عنوان المبادرة", type: "text", required: true },
    { name: "titleEn", label: "العنوان بالإنجليزية", type: "text" },
    { name: "descriptionAr", label: "الوصف", type: "textarea" },
    { name: "startDate", label: "تاريخ البدء", type: "date" },
    { name: "endDate", label: "تاريخ الانتهاء", type: "date" },
    { name: "targetBeneficiaries", label: "عدد المستفيدين المستهدف", type: "number" },
    { name: "budgetAllocated", label: "الميزانية المقترحة (ريال)", type: "number" },
    {
      name: "vision2030Pillar", label: "ركيزة رؤية 2030", type: "select",
      options: [
        { value: "مجتمع حيوي", label: "مجتمع حيوي" },
        { value: "اقتصاد مزدهر", label: "اقتصاد مزدهر" },
        { value: "وطن طموح", label: "وطن طموح" },
      ],
    },
    {
      name: "sdgGoals", label: "أهداف التنمية المستدامة ذات الصلة", type: "multiselect",
      options: Object.entries(SDG_LABELS).map(([num, label]) => ({ value: num, label: `${num}. ${label}` })),
    },
    { name: "tags", label: "الوسوم (مفصولة بفاصلة)", type: "text" },
  ],
  partnerships: [
    { name: "partnerNameAr", label: "اسم الجهة بالعربية", type: "text", required: true },
    { name: "partnerNameEn", label: "اسم الجهة بالإنجليزية", type: "text" },
    {
      name: "partnerType", label: "نوع الجهة", type: "select",
      options: [
        { value: "government", label: "حكومية" },
        { value: "private", label: "خاصة" },
        { value: "ngo", label: "غير ربحية" },
        { value: "academic", label: "أكاديمية" },
        { value: "international", label: "دولية" },
      ],
    },
    { name: "partnerSector", label: "القطاع", type: "text", placeholder: "مثال: التعليم، الصحة..." },
    { name: "partnerWebsite", label: "الموقع الإلكتروني", type: "url" },
    { name: "contactName", label: "اسم المسؤول عن التواصل", type: "text" },
    { name: "contactEmail", label: "البريد الإلكتروني", type: "email", required: true },
    { name: "contactPhone", label: "رقم الجوال", type: "tel" },
    { name: "titleAr", label: "عنوان الشراكة المقترحة", type: "text", required: true },
    {
      name: "type", label: "نوع الشراكة", type: "select",
      options: [
        { value: "مذكرة تفاهم", label: "مذكرة تفاهم" },
        { value: "اتفاقية تعاون", label: "اتفاقية تعاون" },
        { value: "رعاية", label: "رعاية" },
        { value: "عقد", label: "عقد" },
      ],
    },
  ],
  consultations: [
    {
      name: "category", label: "نوع الاستشارة", type: "select", required: true,
      options: [
        { value: "academic", label: "أكاديمية" },
        { value: "research", label: "بحثية" },
        { value: "career", label: "مهنية وتطوير ذاتي" },
        { value: "community", label: "مسؤولية مجتمعية" },
        { value: "other", label: "أخرى" },
      ],
    },
    { name: "titleAr", label: "موضوع الاستشارة", type: "text", required: true, maxLength: 120 },
    { name: "descriptionAr", label: "وصف تفصيلي", type: "textarea", required: true },
    { name: "preferredNote", label: "الأوقات المفضلة (اختياري)", type: "text" },
  ],
  events: [
    { name: "orgName", label: "اسم الجهة المنظّمة", type: "text" },
    { name: "contactName", label: "اسم المسؤول عن التواصل", type: "text" },
    { name: "contactEmail", label: "البريد الإلكتروني", type: "email" },
    { name: "contactPhone", label: "رقم الجوال", type: "tel" },
    { name: "titleAr", label: "عنوان الفعالية", type: "text", required: true },
    { name: "descriptionAr", label: "وصف الفعالية", type: "textarea" },
    { name: "startDate", label: "تاريخ الفعالية", type: "date" },
    { name: "capacity", label: "السعة المتوقعة", type: "number" },
    { name: "locationAr", label: "الموقع", type: "text" },
  ],
}
