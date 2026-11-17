// Field definitions mirroring the real forms' field sets (see the forms
// under app/(platform)/initiatives, app/(public)/partners/apply,
// app/(platform)/consultations/new, app/(public)/events/new) so the demo
// collects the same information, just saved into the standalone
// DemoRequest table instead of the real domain tables.
export type DemoFieldType = "text" | "textarea" | "date" | "time" | "number" | "url" | "email" | "tel" | "select" | "multiselect" | "section" | "checkbox"

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
    { name: "coordName", label: "اسم منسق الجهة", type: "text", required: true },
    { name: "coordRole", label: "صفة منسق الجهة", type: "text" },
    { name: "coordPhone", label: "جوال منسق الجهة", type: "tel", placeholder: "05xxxxxxxx" },
    { name: "coordNationalId", label: "هوية منسق الجهة", type: "text", placeholder: "رقم الهوية" },
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
    { name: "expectedAttendance", label: "العدد المتوقع للحضور", type: "number", placeholder: "100" },
    { name: "descriptionAr", label: "وصف الفعالية ومحتواها", type: "textarea", required: true, placeholder: "وصف مفصل عن الفعالية ومحتواها" },
    { name: "goalsAr", label: "أهداف الفعالية", type: "textarea", required: true, placeholder: "الأهداف المراد تحقيقها من الفعالية" },
    {
      name: "targetAudience", label: "الجمهور المستهدف", type: "multiselect",
      options: ["أعضاء هيئة التدريس", "طلاب الجامعة", "الباحثين", "المهنيين المتخصصين", "المجتمع المحلي", "رجال الأعمال", "المنظمات غير الربحية", "الجهات الحكومية", "الإعلاميين", "أخرى"].map((v) => ({ value: v, label: v })),
    },

    { name: "sec_dates", label: "التواريخ والأوقات", type: "section" },
    { name: "startDate", label: "التاريخ المفضل", type: "date", required: true },
    { name: "altDate", label: "تاريخ بديل", type: "date" },
    { name: "startTime", label: "وقت البداية", type: "time" },
    { name: "endTime", label: "وقت النهاية", type: "time" },
    { name: "duration", label: "مدة الفعالية الإجمالية", type: "text", placeholder: "مثال: 3 ساعات، يوم كامل، يومين" },
    { name: "setupTime", label: "وقت التجهيز المطلوب", type: "text", placeholder: "مثال: ساعة قبل الفعالية" },
    { name: "cleanupTime", label: "وقت التنظيف المطلوب", type: "text", placeholder: "مثال: نصف ساعة بعد الفعالية" },

    { name: "sec_venue", label: "متطلبات المكان", type: "section" },
    {
      name: "venueType", label: "نوع المكان المطلوب", type: "select", required: true,
      options: ["قاعة مؤتمرات", "قاعة محاضرات", "مسرح", "صالة معارض", "قاعة تدريب", "مكان مفتوح", "أخرى"].map((v) => ({ value: v, label: v })),
    },
    { name: "accessNeeds", label: "احتياجات إمكانيات الوصول", type: "text", placeholder: "متطلبات لذوي الاحتياجات الخاصة أو كبار السن" },
    { name: "venueRequirements", label: "متطلبات خاصة للمكان", type: "textarea", placeholder: "أي متطلبات خاصة للمكان (ديكور، ترتيب معين، إلخ)" },
    {
      name: "equipment", label: "التجهيزات والمعدات المطلوبة", type: "multiselect",
      options: ["نظام صوتي", "أجهزة عرض (بروجكتر)", "تكييف", "إضاءة خاصة", "أجهزة كمبيوتر", "واي فاي", "منصة أو مسرح", "طاولات وكراسي", "بث مباشر", "تسجيل فيديو", "أمن وحراسة", "خدمات ضيافة", "مواقف سيارات", "أخرى"].map((v) => ({ value: v, label: v })),
    },

    { name: "sec_org", label: "معلومات الجهة المنظمة", type: "section" },
    { name: "contactName", label: "اسم المنظم الرئيسي", type: "text", required: true },
    { name: "contactEmail", label: "البريد الإلكتروني", type: "email" },
    { name: "contactPhone", label: "رقم الجوال", type: "tel" },
    { name: "orgRole", label: "منصب المنظم", type: "text" },
    { name: "orgName", label: "اسم المؤسسة / الجهة", type: "text" },
    {
      name: "orgType", label: "نوع المؤسسة", type: "select",
      options: ["جهة حكومية", "قطاع خاص", "قطاع غير ربحي", "مؤسسة تعليمية", "جمعية", "أخرى"].map((v) => ({ value: v, label: v })),
    },
    { name: "orgAbout", label: "نبذة عن الجهة المنظمة", type: "textarea", placeholder: "وصف مختصر عن الجهة المنظمة" },
    { name: "altContact", label: "جهة اتصال بديلة", type: "text", placeholder: "اسم ورقم بديل للتواصل" },
    { name: "emergencyPhone", label: "رقم طوارئ", type: "tel", placeholder: "رقم للحالات الطارئة أثناء الفعالية" },

    { name: "sec_finance", label: "معلومات مالية وقانونية", type: "section" },
    {
      name: "hasInsurance", label: "هل لديكم تأمين للفعالية؟", type: "select",
      options: ["نعم", "لا"].map((v) => ({ value: v, label: v })),
    },
    {
      name: "costRange", label: "النطاق المتوقع للتكلفة", type: "select",
      options: ["أقل من 10,000 ريال", "10,000 – 50,000 ريال", "50,000 – 100,000 ريال", "أكثر من 100,000 ريال"].map((v) => ({ value: v, label: v })),
    },
    {
      name: "paymentMethod", label: "طريقة الدفع المفضلة", type: "select",
      options: ["تحويل بنكي", "شيك", "رعاية / دعم", "أخرى"].map((v) => ({ value: v, label: v })),
    },

    {
      name: "agree", label: "أوافق على شروط وأحكام استضافة الفعاليات، وأؤكد صحة المعلومات المقدمة، وأتحمل المسؤولية الكاملة عن الفعالية.",
      type: "checkbox", required: true,
    },
  ],
  training: [
    { name: "entityName", label: "اسم الجهة", type: "text", required: true },
    { name: "contactInfo", label: "جهة الاتصال", type: "text", required: true, placeholder: "الاسم / الجوال / البريد" },
    { name: "topicAr", label: "موضوع الاستشارة المطلوبة", type: "textarea", required: true },
    { name: "goalAr", label: "الهدف من الاستشارة", type: "textarea" },
  ],
}
