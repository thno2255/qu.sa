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
    { name: "partnerNameAr", label: "اسم الجهة طالبة الشراكة", type: "text", required: true },
    { name: "partnerAddress", label: "مقر الجهة وعنوانها", type: "text", required: true },
    { name: "partnerActivity", label: "نشاط الجهة", type: "textarea", placeholder: "وصف نشاط الجهة" },
    { name: "partnershipScope", label: "المجالات المستهدفة بالشراكة", type: "textarea", placeholder: "المجالات التي ترغب الجهة في التعاون فيها" },
    {
      name: "type", label: "نوع الشراكة", type: "select",
      options: [
        { value: "مذكرة تفاهم", label: "مذكرة تفاهم" },
        { value: "اتفاقية تعاون", label: "اتفاقية تعاون" },
        { value: "رعاية", label: "رعاية" },
        { value: "عقد", label: "عقد" },
      ],
    },
    { name: "coordName", label: "اسم منسق الجهة", type: "text", required: true },
    { name: "coordRole", label: "صفة منسق الجهة", type: "text" },
    { name: "coordPhone", label: "جوال منسق الجهة", type: "tel" },
    { name: "coordNationalId", label: "هوية منسق الجهة", type: "text" },
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
    {
      name: "eventType", label: "نوع الفعالية", type: "select", required: true,
      options: ["مؤتمر", "ورشة عمل", "ندوة", "منتدى", "معرض", "مسابقة", "حفل", "دورة تدريبية", "أخرى"].map((v) => ({ value: v, label: v })),
    },
    { name: "titleAr", label: "عنوان الفعالية", type: "text", required: true },
    { name: "descriptionAr", label: "وصف الفعالية ومحتواها", type: "textarea", required: true },
    { name: "goalsAr", label: "أهداف الفعالية", type: "textarea" },
    {
      name: "targetAudience", label: "الجمهور المستهدف", type: "multiselect",
      options: ["أعضاء هيئة التدريس", "طلاب الجامعة", "الباحثين", "المهنيين المتخصصين", "المجتمع المحلي", "رجال الأعمال", "المنظمات غير الربحية", "الجهات الحكومية"].map((v) => ({ value: v, label: v })),
    },
    { name: "expectedAttendance", label: "العدد المتوقع للحضور", type: "number" },
    { name: "startDate", label: "التاريخ المفضل", type: "date", required: true },
    { name: "altDate", label: "تاريخ بديل", type: "date" },
    {
      name: "venueType", label: "نوع المكان المطلوب", type: "select",
      options: ["قاعة مؤتمرات", "قاعة محاضرات", "مسرح", "صالة معارض", "قاعة تدريب", "مكان مفتوح", "أخرى"].map((v) => ({ value: v, label: v })),
    },
    {
      name: "equipment", label: "التجهيزات والمعدات المطلوبة", type: "multiselect",
      options: ["نظام صوتي", "أجهزة عرض (بروجكتر)", "تكييف", "إضاءة خاصة", "واي فاي", "منصة أو مسرح", "طاولات وكراسي", "بث مباشر", "تسجيل فيديو", "مواقف سيارات"].map((v) => ({ value: v, label: v })),
    },
    { name: "orgName", label: "اسم الجهة المنظّمة", type: "text" },
    { name: "contactName", label: "اسم المنظّم الرئيسي", type: "text" },
    { name: "contactEmail", label: "البريد الإلكتروني", type: "email" },
    { name: "contactPhone", label: "رقم الجوال", type: "tel" },
  ],
  training: [
    { name: "titleAr", label: "اسم الدورة أو البرنامج المطلوب", type: "text", required: true },
    { name: "orgName", label: "اسم الجهة الطالبة", type: "text" },
    { name: "fieldAr", label: "المجال التدريبي", type: "text", required: true, placeholder: "مثال: ريادة الأعمال، الأمن السيبراني..." },
    { name: "targetGroup", label: "الفئة المستهدفة وحجمها التقديري", type: "text", placeholder: "مثال: 20 موظفًا إداريًا" },
    { name: "descriptionAr", label: "الاحتياج التدريبي ونتيجته المتوقعة", type: "textarea" },
    { name: "preferredDate", label: "التاريخ المقترح", type: "date" },
    { name: "hoursCount", label: "عدد الساعات المطلوبة", type: "number" },
    { name: "contactName", label: "اسم المسؤول عن التواصل", type: "text" },
    { name: "contactEmail", label: "البريد الإلكتروني", type: "email" },
    { name: "contactPhone", label: "رقم الجوال", type: "tel" },
  ],
}
