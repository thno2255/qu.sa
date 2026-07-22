import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "../../core/auth/utils"

const connectionString = process.env.DATABASE_URL ?? ""
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

// ── helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}
function monthsAgo(n: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}
function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

// ── 1. USERS ─────────────────────────────────────────────────────────────────
const STUDENT_NAMES = [
  "محمد العتيبي", "عبدالله القحطاني", "سلطان الدوسري", "فيصل الشمري",
  "خالد الزهراني", "عمر السبيعي", "يوسف العنزي", "ماجد الحربي",
  "طارق المطيري", "راشد الرشيدي", "بندر الغامدي", "نواف الحازمي",
  "وليد البلوي", "علي المالكي", "أحمد القرني", "حمد العجمي",
  "سعود الصاعدي", "فهد الرويلي", "مشعل السلمي", "صالح البقمي",
  "عبدالرحمن الشهراني", "سامي الحقيل", "إبراهيم الجهني", "نايف الثبيتي",
  "جابر الخثعمي", "سارة القحطاني", "نورة العتيبي", "رنا الدوسري",
  "هند الشمري", "لمى الزهراني", "ريم السبيعي", "دانة العنزي",
  "أميرة الحربي", "غادة المطيري", "شيماء الرشيدي", "منى الغامدي",
  "إيمان الحازمي", "هيفاء البلوي", "ملاك المالكي", "رنا القرني",
  "بدور العجمي", "دينا الصاعدي", "لجين الرويلي", "نجلاء السلمي",
  "ولاء البقمي", "رشا الشهراني", "مروة الحقيل", "نهى الجهني",
  "سناء الثبيتي", "وئام الخثعمي", "سلمى الحربي", "عفاف المطيري",
  "زينب الرشيدي", "هلا الغامدي", "ثريا الحازمي", "عائشة البلوي",
  "مضاوي المالكي", "نضال القرني", "كوثر العجمي", "مها الصاعدي",
]

const FACULTY_NAMES = [
  "د. محمد عبدالله الأحمدي", "د. عبدالعزيز علي الخالدي", "د. سعد محمد القرشي",
  "د. عثمان إبراهيم الحارثي", "د. ناصر سلمان الفارس", "د. وليد عمر الشهري",
  "د. سلطان محمد العسيري", "د. فيصل أحمد الزيد", "د. خالد عبدالرحمن النجار",
  "د. يوسف مساعد الجابر", "د. ريم عبدالله المنصور", "د. هالة محمد الغامدي",
  "د. سمية عبدالعزيز السلمان", "د. منيرة سعد الحربي", "د. أميرة وليد العتيبي",
  "د. نجلاء فهد الدوسري", "د. فاطمة ناصر السبيعي", "د. لطيفة علي الشمري",
  "د. حنان مساعد القحطاني", "د. نوف سلطان العنزي",
]

const EXTERNAL_ORG_NAMES = [
  ["شركة المستقبل للتقنية", "Al-Mustaqbal Technology Co."],
  ["مؤسسة البناء للتطوير", "Al-Bina Development Foundation"],
  ["شركة النور للاستشارات", "Al-Nour Consulting Co."],
  ["جمعية الرعاية الاجتماعية", "Social Care Association"],
  ["مركز الإبداع والابتكار", "Innovation & Creativity Center"],
  ["شركة الفجر للخدمات", "Al-Fajr Services Co."],
  ["مؤسسة المسار للتدريب", "Al-Masar Training Foundation"],
  ["شركة اليسر للحلول", "Al-Yusr Solutions Co."],
]

const DEPT_HEAD_NAMES = [
  "أ.د. سعيد عبدالله الزهراني", "أ.د. فهد محمد الشريف", "أ.د. عادل علي البسام",
  "أ.د. تركي ناصر المطيري", "أ.د. منيرة سعد الثبيتي", "أ.د. هند عبدالرحمن الغامدي",
  "أ.د. سلوى محمد الحازمي",
]

// ── 2. INITIATIVES ───────────────────────────────────────────────────────────
const INITIATIVES_DATA = [
  { titleAr: "برنامج دعم الأسر المحتاجة في القصيم", desc: "برنامج شامل لتقديم المساعدات المادية والعينية للأسر المحتاجة في منطقة القصيم بالتعاون مع الجهات الخيرية", status: "active", sdg: [1, 2], beneficiaries: 1200, budget: 150000 },
  { titleAr: "مبادرة محو الأمية في الأحياء الشعبية", desc: "برنامج لمحو الأمية يستهدف البالغين في الأحياء الشعبية بمدينة بريدة وعنيزة وضرما", status: "active", sdg: [4], beneficiaries: 800, budget: 80000 },
  { titleAr: "حملة توعية الشباب بمخاطر المخدرات", desc: "حملة توعوية شاملة تستهدف طلاب المرحلة الثانوية والجامعية لمواجهة مخاطر الإدمان", status: "completed", sdg: [3, 16], beneficiaries: 5000, budget: 60000 },
  { titleAr: "مبادرة تنظيف البيئة والحفاظ عليها", desc: "مبادرة جماعية لتنظيف الشوارع والحدائق العامة وزرع الأشجار في مناطق متعددة بالقصيم", status: "active", sdg: [11, 15], beneficiaries: 3000, budget: 45000 },
  { titleAr: "برنامج زرع الأشجار ومكافحة التصحر", desc: "مشروع زراعي لزرع أكثر من 10 آلاف شجرة في المناطق الجرداء بمنطقة القصيم", status: "completed", sdg: [13, 15], beneficiaries: 10000, budget: 200000 },
  { titleAr: "مبادرة دعم ذوي الإعاقة والتوحد", desc: "برنامج متكامل لدعم الأشخاص ذوي الإعاقة من خلال التأهيل المهني والدمج المجتمعي", status: "active", sdg: [3, 10], beneficiaries: 350, budget: 120000 },
  { titleAr: "حملة التوعية الصحية الشاملة", desc: "حملة صحية تشمل الكشف المبكر عن الأمراض المزمنة وتعزيز ثقافة اللياقة البدنية", status: "active", sdg: [3], beneficiaries: 8000, budget: 90000 },
  { titleAr: "برنامج تمكين المرأة اقتصادياً", desc: "برنامج تدريبي وتأهيلي للمرأة في مجالات ريادة الأعمال والحرف اليدوية والتجارة الإلكترونية", status: "active", sdg: [5, 8], beneficiaries: 600, budget: 95000 },
  { titleAr: "مبادرة دعم الطلاب المتفوقين المحتاجين", desc: "برنامج لمنح المنح الدراسية والدعم الأكاديمي للطلاب المتفوقين من الأسر ذات الدخل المحدود", status: "approved", sdg: [4, 10], beneficiaries: 200, budget: 75000 },
  { titleAr: "برنامج تطوير مهارات الشباب الرقمية", desc: "تدريب الشباب على مهارات التكنولوجيا والبرمجة والأمن السيبراني لتهيئتهم لسوق العمل الرقمي", status: "active", sdg: [4, 8, 9], beneficiaries: 1500, budget: 180000 },
  { titleAr: "مشروع قراءة للجميع في القصيم", desc: "إنشاء مكتبات متنقلة ومراكز قراءة مجانية في الأحياء الشعبية لتعزيز ثقافة القراءة", status: "completed", sdg: [4], beneficiaries: 4000, budget: 55000 },
  { titleAr: "مبادرة المدن الخضراء والتنمية المستدامة", desc: "تحويل المساحات العامة إلى مناطق خضراء صديقة للبيئة بالتعاون مع بلديات القصيم", status: "pending", sdg: [11, 13, 15], beneficiaries: 50000, budget: 500000 },
  { titleAr: "برنامج الرعاية الصحية للمسنين", desc: "خدمات صحية ونفسية واجتماعية متكاملة لكبار السن في دور الرعاية والمنازل", status: "active", sdg: [3, 10], beneficiaries: 400, budget: 70000 },
  { titleAr: "مبادرة التعليم عن بُعد للمناطق النائية", desc: "توفير البنية التحتية الرقمية والمحتوى التعليمي للطلاب في القرى والمناطق البعيدة", status: "approved", sdg: [4, 9], beneficiaries: 2000, budget: 300000 },
  { titleAr: "حملة السلامة المرورية في الجامعات", desc: "برنامج توعوي لتعزيز السلامة المرورية بين طلاب الجامعات وتقليل حوادث الطريق", status: "completed", sdg: [3, 11], beneficiaries: 12000, budget: 40000 },
  { titleAr: "مبادرة ريادة الأعمال الاجتماعية", desc: "حضانة أعمال اجتماعية تدعم المشاريع التي تحل مشكلات مجتمعية وتحقق عوائد اقتصادية", status: "active", sdg: [8, 9, 10], beneficiaries: 150, budget: 250000 },
  { titleAr: "برنامج التكامل الأسري والتنمية", desc: "برامج إرشادية وتدريبية لتعزيز الترابط الأسري ومهارات التربية الإيجابية", status: "active", sdg: [3, 5, 16], beneficiaries: 900, budget: 65000 },
  { titleAr: "مشروع تحسين جودة المياه في القرى", desc: "توفير منظومات تنقية المياه في القرى الصغيرة وتوعية السكان بأهمية سلامة المياه", status: "pending", sdg: [6], beneficiaries: 5000, budget: 180000 },
  { titleAr: "مبادرة دعم الأطفال ذوي الاحتياجات الخاصة", desc: "خدمات التأهيل والتعليم والدعم النفسي للأطفال ذوي الاحتياجات الخاصة وأسرهم", status: "active", sdg: [3, 4, 10], beneficiaries: 280, budget: 130000 },
  { titleAr: "حملة توعية الطاقة المتجددة والترشيد", desc: "نشر ثقافة ترشيد الطاقة والتوعية بالطاقة الشمسية في المنازل والمنشآت الصغيرة", status: "completed", sdg: [7, 13], beneficiaries: 6000, budget: 50000 },
  { titleAr: "برنامج التدريب المهني للخريجين", desc: "برامج تدريب مهني متخصصة لخريجي الجامعات لتعزيز مهاراتهم وزيادة فرص توظيفهم", status: "active", sdg: [4, 8], beneficiaries: 750, budget: 160000 },
  { titleAr: "مبادرة إعادة تدوير النفايات المجتمعية", desc: "مشروع تجميع وفرز وإعادة تدوير النفايات بمشاركة الأسر والمدارس والمجمعات السكنية", status: "active", sdg: [12, 11], beneficiaries: 20000, budget: 85000 },
  { titleAr: "برنامج الصحة النفسية ومواجهة الاكتئاب", desc: "توفير خدمات الدعم النفسي والإرشاد للطلاب والشباب وتقليل وصمة الصحة النفسية", status: "active", sdg: [3], beneficiaries: 2000, budget: 70000 },
  { titleAr: "مشروع دعم التعليم التقني والمهني", desc: "شراكات مع معاهد التدريب التقني لتوفير برامج تدريبية موجهة لسوق العمل", status: "pending", sdg: [4, 8, 9], beneficiaries: 1000, budget: 200000 },
  { titleAr: "مبادرة الشراكات الدولية والتبادل المعرفي", desc: "بناء شراكات مع جامعات دولية لتبادل الخبرات وتطوير برامج المسؤولية المجتمعية", status: "draft", sdg: [17], beneficiaries: 500, budget: 120000 },
  { titleAr: "حملة التبرع بالدم والتوعية بالتبرع بالأعضاء", desc: "حملات دورية للتبرع بالدم في الجامعة وتوعية الطلاب والموظفين بأهمية التبرع بالأعضاء", status: "completed", sdg: [3], beneficiaries: 3000, budget: 25000 },
  { titleAr: "برنامج مكافحة الفقر وصرف الزكوات", desc: "إنشاء صندوق للزكاة والصدقات بالشراكة مع هيئة الزكاة لصرفها على مستحقيها في المنطقة", status: "active", sdg: [1, 10], beneficiaries: 600, budget: 400000 },
  { titleAr: "مبادرة تعزيز الهوية الوطنية والانتماء", desc: "برامج ثقافية وتاريخية لتعزيز الهوية الوطنية السعودية والانتماء لدى الطلاب والشباب", status: "completed", sdg: [4, 16], beneficiaries: 7000, budget: 35000 },
  { titleAr: "مشروع البيوت الآمنة وإعادة تأهيلها", desc: "إصلاح وترميم منازل الأسر المحتاجة وضمان السلامة المعيشية لساكنيها", status: "active", sdg: [1, 11], beneficiaries: 80, budget: 320000 },
  { titleAr: "برنامج الصيد المستدام والأمن الغذائي", desc: "تدريب المزارعين والصيادين على التقنيات الحديثة لضمان الأمن الغذائي في المنطقة", status: "draft", sdg: [2, 14, 15], beneficiaries: 200, budget: 90000 },
  { titleAr: "مبادرة دعم القطاع غير الربحي", desc: "بناء قدرات الجمعيات الخيرية والمنظمات غير الربحية في القصيم من خلال التدريب والدعم الفني", status: "pending", sdg: [17], beneficiaries: 40, budget: 60000 },
  { titleAr: "حملة الأمن السيبراني وحماية البيانات", desc: "توعية الطلاب والموظفين بمخاطر الفضاء الإلكتروني وأهمية حماية الخصوصية الرقمية", status: "active", sdg: [9, 16], beneficiaries: 5000, budget: 30000 },
  { titleAr: "برنامج الصحة الإنجابية والتثقيف الأسري", desc: "برامج توعية للمقبلين على الزواج والأسر الشابة في مجالات الصحة الإنجابية والتخطيط الأسري", status: "pending", sdg: [3, 5], beneficiaries: 800, budget: 55000 },
  { titleAr: "مبادرة التوعية البيئية في المدارس", desc: "دمج مفاهيم الاستدامة والبيئة في المناهج الدراسية من خلال ورش عمل وزيارات ميدانية", status: "active", sdg: [4, 13, 15], beneficiaries: 15000, budget: 40000 },
  { titleAr: "برنامج الاستشارات القانونية للمواطنين", desc: "تقديم استشارات قانونية مجانية للمواطنين من ذوي الدخل المحدود في مجالات الأحوال الشخصية والعمل", status: "draft", sdg: [16, 10], beneficiaries: 300, budget: 30000 },
]

// ── 3. PROJECTS ──────────────────────────────────────────────────────────────
const PROJECTS_DATA = [
  { titleAr: "مشروع تطوير منظومة الإرشاد الأكاديمي", desc: "بناء نظام رقمي متكامل للإرشاد الأكاديمي يربط الطلاب بالمرشدين ويتيح تتبع التقدم الدراسي", status: "active", sdg: [4], budget: 180000, risk: "low" },
  { titleAr: "مشروع إنشاء حديقة الجامعة البيئية", desc: "تصميم وتنفيذ حديقة بيئية تعليمية داخل حرم الجامعة تضم نباتات محلية ومزرعة نموذجية", status: "active", sdg: [15, 11], budget: 250000, risk: "medium" },
  { titleAr: "مشروع قاعدة بيانات الشراكات المجتمعية", desc: "إنشاء منظومة رقمية موحدة لإدارة الشراكات المجتمعية ومتابعة اتفاقياتها وإصدار الشهادات آلياً", status: "completed", sdg: [17], budget: 95000, risk: "low" },
  { titleAr: "مشروع المختبر الاجتماعي للابتكار", desc: "إنشاء مختبر للابتكار الاجتماعي يتيح للطلاب تطوير حلول تكنولوجية لمشكلات المجتمع", status: "active", sdg: [9, 4], budget: 400000, risk: "medium" },
  { titleAr: "مشروع المكتبة المجتمعية الرقمية", desc: "بناء مكتبة رقمية مفتوحة توفر الكتب والموارد التعليمية مجاناً للمجتمع المحيط بالجامعة", status: "active", sdg: [4], budget: 120000, risk: "low" },
  { titleAr: "مشروع التوثيق والأرشفة للتراث القصيمي", desc: "توثيق التراث المادي وغير المادي لمنطقة القصيم في قاعدة بيانات تاريخية رقمية", status: "completed", sdg: [4, 11], budget: 75000, risk: "low" },
  { titleAr: "مشروع برنامج زمالة المسؤولية المجتمعية", desc: "إطلاق برنامج زمالة سنوي لاختيار طلاب متميزين لتنفيذ مشاريع خدمة مجتمع مع دعم مالي", status: "active", sdg: [4, 17], budget: 350000, risk: "low" },
  { titleAr: "مشروع إعادة تأهيل الفضاءات العامة", desc: "تحويل المساحات المهجورة في الأحياء إلى حدائق ومناطق ترفيهية وأماكن تجمع مجتمعية", status: "pending", sdg: [11], budget: 280000, risk: "medium" },
  { titleAr: "مشروع شبكة دعم أصحاب الأعمال الصغيرة", desc: "بناء شبكة لربط أصحاب المشاريع الصغيرة مع خبراء الأعمال والتمويل والأسواق", status: "active", sdg: [8, 10], budget: 140000, risk: "medium" },
  { titleAr: "مشروع مركز الفنون المجتمعية", desc: "إنشاء مركز فنون يقدم برامج تدريبية في الرسم والموسيقى والمسرح مجاناً للشباب", status: "pending", sdg: [4, 11], budget: 320000, risk: "high" },
  { titleAr: "مشروع تحليل البيانات لتحسين الخدمات", desc: "استخدام تحليلات البيانات الكبيرة لتحسين توجيه خدمات المسؤولية المجتمعية ورصد الأثر", status: "completed", sdg: [9, 17], budget: 85000, risk: "low" },
  { titleAr: "مشروع تطوير مناهج المسؤولية المجتمعية", desc: "دمج مقرر دراسي إلزامي في المسؤولية المجتمعية وخدمة المجتمع في جميع برامج الجامعة", status: "active", sdg: [4], budget: 60000, risk: "low" },
  { titleAr: "مشروع بناء شراكات مع القطاع الخاص", desc: "وضع إطار منهجي لبناء شراكات استراتيجية مع الشركات الكبرى لتمويل برامج المسؤولية المجتمعية", status: "active", sdg: [17, 8], budget: 50000, risk: "low" },
  { titleAr: "مشروع مركز الاستشارات القانونية المجانية", desc: "إنشاء مركز للمساعدة القانونية يديره طلاب الحقوق بإشراف أساتذة متخصصين لخدمة المجتمع", status: "pending", sdg: [16, 10], budget: 45000, risk: "low" },
  { titleAr: "مشروع تدريب المعلمين على مهارات القرن 21", desc: "برنامج تطوير مهني للمعلمين في القرى والأرياف لتطوير أساليب التدريس الحديثة", status: "active", sdg: [4, 17], budget: 95000, risk: "low" },
  { titleAr: "مشروع ربط الجامعة بالحي المحيط بها", desc: "برامج خروج مجتمعي تربط أقسام الجامعة بالمجتمعات المحلية القريبة بشكل منهجي ومستدام", status: "completed", sdg: [11, 17], budget: 70000, risk: "low" },
  { titleAr: "مشروع الطاقة الشمسية للمجتمعات الريفية", desc: "تركيب منظومات طاقة شمسية في القرى الريفية لتوفير الكهرباء النظيفة والمستدامة", status: "active", sdg: [7, 1, 13], budget: 600000, risk: "medium" },
  { titleAr: "مشروع تطوير محتوى تعليمي بالذكاء الاصطناعي", desc: "استخدام الذكاء الاصطناعي لإنشاء محتوى تعليمي مخصص للطلاب ذوي الاحتياجات الخاصة", status: "draft", sdg: [4, 9, 10], budget: 220000, risk: "high" },
  { titleAr: "مشروع ترميم المساجد التاريخية في القصيم", desc: "صون وترميم المساجد التاريخية في منطقة القصيم والتوثيق الأرشيفي لتراثها المعماري", status: "pending", sdg: [11], budget: 380000, risk: "medium" },
  { titleAr: "مشروع الفرق الطلابية لخدمة الطوارئ", desc: "تأسيس فرق طلابية مدربة للتعامل مع الكوارث والطوارئ المحلية بالتعاون مع الدفاع المدني", status: "draft", sdg: [11, 16, 3], budget: 85000, risk: "medium" },
]

// ── 4. PARTNERS ──────────────────────────────────────────────────────────────
const PARTNERS_DATA = [
  { nameAr: "وزارة الصحة", nameEn: "Ministry of Health", type: "GOVERNMENT", sector: "health" },
  { nameAr: "هدف — صندوق تنمية الموارد البشرية", nameEn: "HRDF (Hadaf)", type: "GOVERNMENT", sector: "employment" },
  { nameAr: "بنك الرياض", nameEn: "Riyad Bank", type: "PRIVATE", sector: "finance" },
  { nameAr: "مستشفى القصيم الوطني", nameEn: "Qassim National Hospital", type: "HEALTHCARE", sector: "health" },
  { nameAr: "أمانة منطقة القصيم", nameEn: "Qassim Region Municipality", type: "GOVERNMENT", sector: "municipal" },
  { nameAr: "جمعية البر الخيرية بالقصيم", nameEn: "Al-Bir Charity Society", type: "NGO", sector: "charity" },
  { nameAr: "شركة STC", nameEn: "Saudi Telecom Company", type: "PRIVATE", sector: "telecom" },
  { nameAr: "الشركة السعودية للكهرباء", nameEn: "Saudi Electricity Company", type: "PRIVATE", sector: "energy" },
  { nameAr: "غرفة القصيم التجارية", nameEn: "Qassim Chamber of Commerce", type: "PRIVATE", sector: "commerce" },
  { nameAr: "وزارة الموارد البشرية والتنمية الاجتماعية", nameEn: "Ministry of Human Resources", type: "GOVERNMENT", sector: "social" },
  { nameAr: "جمعية الهلال الأحمر السعودي", nameEn: "Saudi Red Crescent", type: "NGO", sector: "health" },
  { nameAr: "وزارة البيئة والمياه والزراعة", nameEn: "Ministry of Environment", type: "GOVERNMENT", sector: "environment" },
  { nameAr: "شركة زين السعودية", nameEn: "Zain Saudi Arabia", type: "PRIVATE", sector: "telecom" },
  { nameAr: "وزارة التعليم", nameEn: "Ministry of Education", type: "GOVERNMENT", sector: "education" },
  { nameAr: "جمعية رعاية الأيتام", nameEn: "Orphan Care Society", type: "NGO", sector: "social" },
  { nameAr: "بنك التنمية الاجتماعية", nameEn: "Social Development Bank", type: "GOVERNMENT", sector: "finance" },
  { nameAr: "شركة أرامكو السعودية", nameEn: "Saudi Aramco", type: "PRIVATE", sector: "energy" },
  { nameAr: "مركز الملك عبدالعزيز للحوار الوطني", nameEn: "King Abdulaziz Center for National Dialogue", type: "GOVERNMENT", sector: "social" },
]

// ── 6. NEWS ARTICLES ─────────────────────────────────────────────────────────
const NEWS_DATA = [
  { titleAr: "جامعة القصيم تطلق برنامجاً لدعم 1200 أسرة محتاجة في المنطقة", excerpt: "أعلنت جامعة القصيم عن إطلاق برنامجها السنوي لدعم الأسر المحتاجة بالتعاون مع جمعية البر الخيرية", tags: ["دعم اجتماعي", "أسر"] },
  { titleAr: "اتفاقية شراكة استراتيجية بين الجامعة وشركة STC لتطوير برامج التحول الرقمي", excerpt: "وقّعت جامعة القصيم اتفاقية شراكة مع شركة الاتصالات السعودية لدعم برامج التحول الرقمي المجتمعي", tags: ["شراكة", "تقنية"] },
  { titleAr: "أكثر من 5000 مستفيد من حملة التوعية الصحية الشاملة للفصل الأول", excerpt: "استقطبت حملة التوعية الصحية آلاف المراجعين في مراكز الفحص الصحي المجاني التي أقامتها الجامعة", tags: ["صحة", "توعية"] },
  { titleAr: "طلاب الجامعة يزرعون 3000 شجرة في حملة لمكافحة التصحر", excerpt: "نفّذ طلاب الجامعة حملة زراعية واسعة شملت عدة مناطق في القصيم ضمن مبادرة البيئة الخضراء", tags: ["بيئة", "استدامة"] },
  { titleAr: "انطلاق برنامج الزمالة المجتمعية لاختيار 20 طالباً متميزاً", excerpt: "فتحت جامعة القصيم باب التقديم لبرنامج الزمالة المجتمعية السنوي لاختيار 20 طالباً لتنفيذ مشاريع خدمة مجتمع", tags: ["زمالة", "طلاب"] },
  { titleAr: "افتتاح مركز الابتكار الاجتماعي في الحرم الجامعي", excerpt: "أُفتتح مركز الابتكار الاجتماعي الذي يُتيح للطلاب تطوير حلول تكنولوجية للمشكلات المجتمعية", tags: ["ابتكار", "تقنية"] },
  { titleAr: "خريجو برنامج التدريب المهني يحصلون على فرص توظيف بنسبة 78٪", excerpt: "أعلنت إدارة المسؤولية المجتمعية أن 78٪ من خريجي البرنامج التدريبي حصلوا على وظائف خلال 3 أشهر", tags: ["تدريب", "توظيف"] },
  { titleAr: "تعاون مشترك مع وزارة الصحة لتوفير خدمات طبية مجانية للأسر الفقيرة", excerpt: "وقّعت الجامعة بروتوكول تعاون مع وزارة الصحة لتقديم خدمات طبية مجانية للأسر الفقيرة في المنطقة", tags: ["صحة", "فقر", "شراكة"] },
  { titleAr: "انطلاق برنامج محو الأمية ببريدة بمشاركة 800 متعلم", excerpt: "انطلق البرنامج في ستة مراكز تعليمية بمدينة بريدة بتدريس طلاب الجامعة", tags: ["تعليم", "أمية"] },
  { titleAr: "الجامعة تفوز بجائزة أفضل برنامج مسؤولية مجتمعية في الجامعات السعودية", excerpt: "حصلت جامعة القصيم على جائزة وزارة التعليم لأفضل برنامج مسؤولية مجتمعية بين الجامعات السعودية", tags: ["جائزة", "تميز"] },
  { titleAr: "شراكة مع غرفة القصيم لدعم أصحاب المشاريع الصغيرة والمتوسطة", excerpt: "أطلقت الجامعة بالتعاون مع غرفة القصيم برنامجاً لتقديم الاستشارات والتمويل لأصحاب المشاريع الصغيرة", tags: ["شراكة", "ريادة أعمال"] },
  { titleAr: "خمسة آلاف طالب يشاركون في حملة السلامة المرورية السنوية", excerpt: "شارك 5000 طالب في حملة السلامة المرورية التي شملت ورش عمل وأنشطة توعوية في طرق الجامعة والحي", tags: ["سلامة", "توعية"] },
  { titleAr: "مبادرة التوعية الرقمية تصل إلى 3000 مواطن في الأحياء الشعبية", excerpt: "وصل فريق التوعية الرقمي من طلاب الجامعة إلى 3000 مواطن في الأحياء الشعبية لتعليمهم مهارات الأمان الرقمي", tags: ["رقمنة", "توعية"] },
  { titleAr: "الجامعة تُطلق صندوق الزكاة المجتمعي بدعم 400 ألف ريال", excerpt: "أُطلق صندوق الزكاة المجتمعي بهدف صرف الزكوات على المستحقين بشفافية تامة عبر منظومة رقمية متكاملة", tags: ["زكاة", "مجتمع"] },
  { titleAr: "توقيع اتفاقية دولية مع جامعة القاهرة لتبادل الخبرات المجتمعية", excerpt: "وقّعت الجامعة اتفاقية تبادل معرفي مع جامعة القاهرة في مجال المسؤولية المجتمعية", tags: ["دولي", "تعاون"] },
  { titleAr: "برنامج دعم المرأة يخرّج 200 سيدة أعمال في فصل واحد", excerpt: "أُحتفي بتخريج 200 متدربة من برنامج تمكين المرأة اقتصادياً، وجميعهن بدأن مشاريعهن الخاصة", tags: ["مرأة", "ريادة أعمال"] },
  { titleAr: "ترميم 50 منزلاً لأسر محتاجة ضمن مشروع البيوت الآمنة", excerpt: "أكمل فريق العمل ترميم 50 منزلاً في مناطق متفرقة من القصيم، مما أفاد 300 فرد في أسر محتاجة", tags: ["ترميم", "مسكن", "خيري"] },
  { titleAr: "توسيع خدمات الاستشارات القانونية لتشمل 10 مناطق جديدة", excerpt: "أعلنت الجامعة توسيع مركز الاستشارات القانونية المجانية ليشمل 10 أحياء إضافية في مدينة بريدة", tags: ["قانون", "خدمة"] },
  { titleAr: "نتائج استطلاع الأثر: 92٪ من المستفيدين يُثنون على برامج الجامعة", excerpt: "كشف الاستطلاع السنوي أن 92٪ من المستفيدين من برامج المسؤولية المجتمعية مرتاحون للخدمات المقدمة", tags: ["استطلاع", "أثر", "رضا"] },
  { titleAr: "الجامعة تُشارك في منتدى الأمم المتحدة للتنمية المستدامة", excerpt: "مثّل الجامعة وفد أكاديمي في منتدى الأمم المتحدة لعرض تجربتها في تحقيق أهداف التنمية المستدامة", tags: ["دولي", "أمم متحدة", "استدامة"] },
  { titleAr: "الجامعة تستضيف معرضاً للمشاريع المجتمعية يستقطب 3000 زائر", excerpt: "استضافت الجامعة معرض المشاريع المجتمعية السنوي الذي استقطب آلاف الزوار وأسفر عن شراكات جديدة", tags: ["معرض", "مشاريع"] },
  { titleAr: "برنامج التوعية الصحية يتجاوز 8000 فحص مجاني في الفصل الثاني", excerpt: "تخطت حملة الفحوصات الصحية المجانية 8000 فحص شاملاً ضغط الدم والسكري وصحة العين والأسنان", tags: ["صحة", "فحص", "مجاني"] },
  { titleAr: "التوسع في برامج ذوي الاحتياجات الخاصة ليشمل ثلاث مدن قصيمية", excerpt: "وسّعت الجامعة برامج دعم ذوي الاحتياجات الخاصة لتشمل مدن عنيزة والرس وبريدة", tags: ["إعاقة", "توسع"] },
  { titleAr: "نجاح مشروع الطاقة الشمسية في تزويد 10 قرى بالكهرباء النظيفة", excerpt: "أُنجز المرحلة الأولى من مشروع الطاقة الشمسية التي تزود 10 قرى بريفية بالكهرباء بتكاليف منخفضة", tags: ["طاقة", "بيئة", "ريف"] },
  { titleAr: "مؤتمر دولي في جامعة القصيم حول ابتكارات المسؤولية المجتمعية", excerpt: "استضافت الجامعة مؤتمراً دولياً جمع خبراء من 15 دولة لمناقشة أحدث الابتكارات في المسؤولية المجتمعية", tags: ["مؤتمر", "دولي", "ابتكار"] },
]

// ── 7. CMS EVENTS ────────────────────────────────────────────────────────────
const CMS_EVENTS_DATA = [
  { titleAr: "ملتقى الشراكات المجتمعية السنوي", desc: "ملتقى سنوي يجمع ممثلي الجهات الحكومية والخاصة والمجتمعية لتبادل التجارب وبناء شراكات جديدة", location: "قاعة الملك عبدالله الكبرى — جامعة القصيم", capacity: 500 },
  { titleAr: "ورشة عمل: قياس الأثر الاجتماعي للمشاريع", desc: "ورشة تدريبية متخصصة لمسؤولي المسؤولية المجتمعية في المؤسسات حول منهجيات قياس الأثر", location: "قاعة التدريب رقم 3", capacity: 60 },
  { titleAr: "حملة التبرع بالدم الفصلية", desc: "الحملة الفصلية للتبرع بالدم بالتعاون مع مستشفى القصيم الوطني لتأمين المخزون الدموي", location: "مبنى الطوارئ في الجامعة", capacity: 200 },
  { titleAr: "مهرجان الابتكار المجتمعي 2026", desc: "مهرجان ثقافي وعلمي يعرض فيه الطلاب أفكارهم وحلولهم الإبداعية للمشكلات المجتمعية", location: "قاعة المؤتمرات الرئيسية", capacity: 800 },
  { titleAr: "ندوة: دور الجامعات في تحقيق أهداف رؤية 2030", desc: "ندوة أكاديمية تناقش دور مؤسسات التعليم العالي في دعم مستهدفات رؤية 2030 المجتمعية", location: "مدرج كلية الإدارة", capacity: 300 },
  { titleAr: "برنامج الإعداد المهني للخريجين", desc: "برنامج مكثف لمدة أسبوع يُجهّز الخريجين لسوق العمل من خلال ورش عمل ومقابلات محاكاة", location: "مركز الخريجين الجامعي", capacity: 150 },
  { titleAr: "حفل تكريم الشركاء المتميزين", desc: "الحفل السنوي لتكريم الشركاء المتميزين في خدمة المجتمع خلال العام الماضي", location: "قاعة التكريم الكبرى", capacity: 600 },
  { titleAr: "يوم الصحة المجتمعي — الكشف المجاني", desc: "يوم طبي مجاني يتضمن فحوصات دم وسكري وضغط وصحة عيون لأبناء المجتمع المحيط بالجامعة", location: "المركز الصحي الجامعي", capacity: 500 },
  { titleAr: "ورشة عمل: ريادة الأعمال الاجتماعية", desc: "ورشة لتأهيل الشباب على نماذج ريادة الأعمال الاجتماعية وكيفية بناء مشاريع مربحة وذات أثر اجتماعي", location: "مركز ريادة الأعمال", capacity: 80 },
  { titleAr: "ملتقى الطلاب والقطاع الخاص", desc: "لقاء بين طلاب الجامعة وممثلي الشركات الكبرى لاستعراض فرص التدريب والتوظيف والشراكات", location: "قاعة الشراكات", capacity: 400 },
  { titleAr: "رحلة بيئية: تنظيف مجرى وادي الرمة", desc: "رحلة ميدانية جماعية لتنظيف وادي الرمة وتوعية المشاركين بأهمية المحافظة على البيئة الطبيعية", location: "وادي الرمة — 20 كم شمال بريدة", capacity: 250 },
  { titleAr: "مسابقة مشاريع خدمة المجتمع 2026", desc: "مسابقة سنوية للطلاب لتقديم مشاريعهم المبتكرة في خدمة المجتمع مع جوائز مالية قيّمة", location: "الملعب الرئيسي للجامعة", capacity: 1000 },
  { titleAr: "ورشة إعداد خطة المسؤولية المجتمعية المؤسسية", desc: "ورشة موجهة لمسؤولي الشركات لمساعدتهم في وضع خطة متكاملة للمسؤولية المجتمعية لشركاتهم", location: "قاعة اليسر — فندق القصيم بريدة", capacity: 100 },
  { titleAr: "ليلة الشراكات — حفل ختام العام", desc: "حفل ختامي يُحتفل فيه بإنجازات الشركاء ويُعلن عن خطط العام الجديد", location: "حرم الجامعة الرئيسي", capacity: 1500 },
  { titleAr: "كورس مكثف: إدارة المشاريع الاجتماعية", desc: "دورة تدريبية مكثفة لمدة 3 أيام تمنح المشاركين شهادة معتمدة في إدارة المشاريع الاجتماعية", location: "قاعة التدريب رقم 1", capacity: 40 },
  { titleAr: "معسكر الشباب المجتمعي الصيفي", desc: "معسكر صيفي مدته أسبوعان للطلاب يجمع التدريب والأنشطة المجتمعية والترفيهية والثقافية", location: "مخيم جامعة القصيم الصيفي", capacity: 120 },
  { titleAr: "يوم القضاء على الفقر في الجامعة", desc: "يوم توعوي يتزامن مع اليوم العالمي للقضاء على الفقر يشمل محاضرات وعروضاً ومبادرات مجتمعية", location: "جامعة القصيم — قاعات متعددة", capacity: 700 },
  { titleAr: "ورشة بناء القدرات للجمعيات الخيرية", desc: "ورشة عمل لبناء قدرات مدراء الجمعيات الخيرية في مجالات الحوكمة والتخطيط وجمع التبرعات", location: "غرفة القصيم التجارية", capacity: 60 },
  { titleAr: "ختام مشروع الطاقة الشمسية ورحلة الميدان", desc: "حفل ختام مشروع الطاقة الشمسية ورحلة ميدانية للقرى المستفيدة لتوثيق الأثر الإيجابي للمشروع", location: "قرى ريفية في شمال القصيم", capacity: 80 },
  { titleAr: "ملتقى القيادات الطلابية في خدمة المجتمع", desc: "لقاء القيادات الطلابية من جميع كليات الجامعة لتنسيق جهود المسؤولية المجتمعية وتبادل التجارب", location: "قاعة النشاط الطلابي", capacity: 200 },
  { titleAr: "يوم الإرشاد الأكاديمي المجاني للثانويين", desc: "يوم مفتوح لطلاب المرحلة الثانوية لتقديم الإرشاد الأكاديمي والمهني المجاني بإشراف أساتذة الجامعة", location: "الحرم الجامعي", capacity: 350 },
  { titleAr: "ورشة التواصل الفعال مع المجتمع", desc: "ورشة لتأهيل الطلاب على مهارات التواصل مع مختلف فئات المجتمع والتعامل مع الحالات الصعبة", location: "قاعة التدريب رقم 2", capacity: 50 },
  { titleAr: "مسيرة الوعي البيئي السنوية", desc: "مسيرة مجتمعية بمشاركة الطلاب وأبناء المجتمع للتوعية بأهمية المحافظة على البيئة", location: "حديقة بريدة المركزية", capacity: 600 },
  { titleAr: "مهرجان التراث القصيمي والفنون الشعبية", desc: "مهرجان سنوي لتوثيق وإحياء التراث الشعبي القصيمي بمشاركة الفنانين والحرفيين والمثقفين", location: "قلعة بريدة التاريخية", capacity: 2000 },
  { titleAr: "يوم الزراعة المجتمعية في المزارع الاجتماعية", desc: "يوم عمل ميداني في المزارع الاجتماعية المحيطة بالجامعة يشمل الزراعة والحصاد وتوزيع المنتجات", location: "مزارع الجامعة — الضواحي الجنوبية", capacity: 150 },
  { titleAr: "ملتقى الخير — السوق الخيري السنوي", desc: "سوق خيري يعرض فيه الطلاب وذوو الاحتياجات منتجاتهم وحرفهم اليدوية بهدف دعمهم ماديًا", location: "ساحة الجامعة الخارجية", capacity: 3000 },
  { titleAr: "حملة توعية رمضان الخيرية", desc: "سلسلة فعاليات خيرية خلال شهر رمضان تشمل توزيع وجبات الإفطار وحزم رمضان للأسر المحتاجة", location: "مساجد وأحياء بريدة", capacity: 500 },
  { titleAr: "اليوم الوطني للمسؤولية المجتمعية في الجامعات", desc: "يوم وطني تستضيفه جامعة القصيم يجمع جامعات المملكة لتبادل التجارب وأفضل الممارسات", location: "جامعة القصيم — المبنى الإداري", capacity: 400 },
  { titleAr: "برنامج القيادة المجتمعية للطالبات", desc: "برنامج متخصص لتأهيل الطالبات على القيادة المجتمعية وإدارة المشاريع الاجتماعية والتواصل المهني", location: "حرم الطالبات", capacity: 100 },
]

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding comprehensive demo data...\n")

  const demoPassword = await hashPassword("Demo@2026!")

  // ── Step 1: Organizations for external users ─────────────────────────────
  console.log("[1] Creating organizations and external users...")
  const orgIds: string[] = []
  for (let i = 0; i < EXTERNAL_ORG_NAMES.length; i++) {
    const [nameAr, nameEn] = EXTERNAL_ORG_NAMES[i]
    const org = await prisma.organization.upsert({
      where: { id: `demo-org-ext-${i}` },
      update: {},
      create: {
        id: `demo-org-ext-${i}`,
        nameAr,
        nameEn,
        type: "COMPANY",
        status: "APPROVED",
        email: `contact${i}@example-org.sa`,
        city: pick(["بريدة", "عنيزة", "الرياض", "جدة"]),
        country: "SA",
        createdAt: monthsAgo(Math.floor(Math.random() * 12)),
      },
    })
    orgIds.push(org.id)

    await prisma.user.upsert({
      where: { email: `ext${i + 1}@example-org.sa` },
      update: {},
      create: {
        email: `ext${i + 1}@example-org.sa`,
        name: `ممثل ${nameAr}`,
        nameAr: `ممثل ${nameAr}`,
        userType: "EXTERNAL_ENTITY",
        status: "ACTIVE",
        passwordHash: demoPassword,
        organizationId: org.id,
        createdAt: monthsAgo(Math.floor(Math.random() * 10)),
      },
    })
  }

  // ── Step 2: Internal users ───────────────────────────────────────────────
  console.log("[2] Creating 113 internal users...")

  const studentRoleId = await prisma.role.findFirst({ where: { name: "student" }, select: { id: true } }).then(r => r?.id ?? "")
  const facultyRoleId = await prisma.role.findFirst({ where: { name: "faculty_member" }, select: { id: true } }).then(r => r?.id ?? "")
  const deptHeadRoleId = await prisma.role.findFirst({ where: { name: "department_head" }, select: { id: true } }).then(r => r?.id ?? "")
  const employeeRoleId = await prisma.role.findFirst({ where: { name: "community_employee" }, select: { id: true } }).then(r => r?.id ?? "")

  const studentIds: string[] = []
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `s${i + 1}@qu.edu.sa` },
      update: {},
      create: {
        email: `s${i + 1}@qu.edu.sa`,
        name: STUDENT_NAMES[i],
        nameAr: STUDENT_NAMES[i],
        userType: "STUDENT",
        status: "ACTIVE",
        passwordHash: demoPassword,
        universityId: `202${Math.floor(Math.random() * 9)}000${String(i + 1).padStart(3, "0")}`,
        createdAt: monthsAgo(Math.floor(Math.random() * 24)),
      },
    })
    studentIds.push(user.id)
    if (studentRoleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: studentRoleId } },
        update: {},
        create: { userId: user.id, roleId: studentRoleId, grantedBy: "demo-admin" },
      })
    }
  }

  const facultyIds: string[] = []
  for (let i = 0; i < FACULTY_NAMES.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `f${i + 1}@qu.edu.sa` },
      update: {},
      create: {
        email: `f${i + 1}@qu.edu.sa`,
        name: FACULTY_NAMES[i],
        nameAr: FACULTY_NAMES[i],
        userType: "FACULTY_MEMBER",
        status: "ACTIVE",
        passwordHash: demoPassword,
        jobTitle: pick(["أستاذ مساعد", "أستاذ مشارك", "أستاذ"]),
        createdAt: monthsAgo(Math.floor(Math.random() * 36)),
      },
    })
    facultyIds.push(user.id)
    if (facultyRoleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: facultyRoleId } },
        update: {},
        create: { userId: user.id, roleId: facultyRoleId, grantedBy: "demo-admin" },
      })
    }
  }

  const deptHeadIds: string[] = []
  for (let i = 0; i < DEPT_HEAD_NAMES.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `dh${i + 1}@qu.edu.sa` },
      update: {},
      create: {
        email: `dh${i + 1}@qu.edu.sa`,
        name: DEPT_HEAD_NAMES[i],
        nameAr: DEPT_HEAD_NAMES[i],
        userType: "DEPARTMENT_HEAD",
        status: "ACTIVE",
        passwordHash: demoPassword,
        jobTitle: "رئيس قسم",
        createdAt: monthsAgo(Math.floor(Math.random() * 48)),
      },
    })
    deptHeadIds.push(user.id)
    if (deptHeadRoleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: deptHeadRoleId } },
        update: {},
        create: { userId: user.id, roleId: deptHeadRoleId, grantedBy: "demo-admin" },
      })
    }
  }

  // Extra community employees
  const communityEmployeeNames = [
    "نورة محمد السلمان", "سلطان عبدالله الحارثي", "ريم سعد المنصور",
    "فهد علي الشمري", "غادة محمد العتيبي", "بدر ناصر الحازمي",
    "هند عبدالعزيز القحطاني", "ماجد سلمان الزهراني",
  ]
  for (let i = 0; i < communityEmployeeNames.length; i++) {
    const user = await prisma.user.upsert({
      where: { email: `ce${i + 1}@qu.edu.sa` },
      update: {},
      create: {
        email: `ce${i + 1}@qu.edu.sa`,
        name: communityEmployeeNames[i],
        nameAr: communityEmployeeNames[i],
        userType: "COMMUNITY_EMPLOYEE",
        status: "ACTIVE",
        passwordHash: demoPassword,
        jobTitle: "موظف مسؤولية مجتمعية",
        createdAt: monthsAgo(Math.floor(Math.random() * 24)),
      },
    })
    if (employeeRoleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: employeeRoleId } },
        update: {},
        create: { userId: user.id, roleId: employeeRoleId, grantedBy: "demo-admin" },
      })
    }
  }

  const totalUsers = await prisma.user.count()
  console.log(`  ✓ Total users: ${totalUsers}`)

  // ── Step 3: Partners ─────────────────────────────────────────────────────
  console.log("[3] Creating partners...")
  const partnerIds: string[] = []
  for (let i = 0; i < PARTNERS_DATA.length; i++) {
    const p = PARTNERS_DATA[i]
    const partner = await prisma.partner.upsert({
      where: { id: `demo-partner-${i}` },
      update: { status: "active" },
      create: {
        id: `demo-partner-${i}`,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        type: p.type,
        sector: p.sector,
        status: "active",
        email: `contact@partner${i}.sa`,
        createdAt: monthsAgo(Math.floor(Math.random() * 24) + 6),
      },
    })
    partnerIds.push(partner.id)
  }
  console.log(`  ✓ ${partnerIds.length} partners created`)

  // ── Step 4: Partnerships ─────────────────────────────────────────────────
  console.log("[4] Creating partnerships...")
  const partnershipStatuses = ["active", "active", "active", "pending", "completed", "expired"]
  const partnershipTypes = ["MOU", "SPONSORSHIP", "COLLABORATIVE", "SERVICE", "RESEARCH"]
  for (let i = 0; i < Math.min(PARTNERS_DATA.length, 18); i++) {
    await prisma.partnership.upsert({
      where: { id: `demo-partnership-${i}` },
      update: {},
      create: {
        id: `demo-partnership-${i}`,
        partnerId: partnerIds[i],
        titleAr: `اتفاقية شراكة مع ${PARTNERS_DATA[i].nameAr}`,
        titleEn: `Partnership Agreement with ${PARTNERS_DATA[i].nameEn}`,
        type: pick(partnershipTypes),
        status: pick(partnershipStatuses),
        startDate: monthsAgo(Math.floor(Math.random() * 18) + 1),
        endDate: daysFromNow(Math.floor(Math.random() * 365) + 30),
        partnershipValue: Math.floor(Math.random() * 500000) + 50000,
        sdgGoals: [Math.floor(Math.random() * 17) + 1, Math.floor(Math.random() * 17) + 1].filter((v, i, a) => a.indexOf(v) === i),
        createdAt: monthsAgo(Math.floor(Math.random() * 18) + 1),
      },
    })
  }
  console.log(`  ✓ 18 partnerships created`)

  // ── Step 5: Initiatives ──────────────────────────────────────────────────
  console.log("[5] Creating 35 initiatives...")
  const initiativeIds: string[] = []
  const ownerPool = ["demo-faculty", "demo-employee", "demo-manager", ...facultyIds.slice(0, 5)]
  for (let i = 0; i < INITIATIVES_DATA.length; i++) {
    const d = INITIATIVES_DATA[i]
    const createdAt = monthsAgo(Math.floor(Math.random() * 11) + 1)
    const init = await prisma.initiative.upsert({
      where: { id: `demo-init-${i}` },
      update: { status: d.status },
      create: {
        id: `demo-init-${i}`,
        titleAr: d.titleAr,
        descriptionAr: d.desc,
        status: d.status,
        ownerId: pick(ownerPool),
        targetBeneficiaries: d.beneficiaries,
        sdgGoals: d.sdg,
        budgetAllocated: d.budget,
        startDate: createdAt,
        endDate: d.status === "completed" ? daysAgo(Math.floor(Math.random() * 60)) : daysFromNow(Math.floor(Math.random() * 180) + 30),
        tags: d.sdg.map(g => SDG_GOALS_TAGS[g] ?? "مجتمع").slice(0, 2),
        createdAt,
      },
    })
    initiativeIds.push(init.id)
  }
  console.log(`  ✓ ${initiativeIds.length} initiatives created`)

  // ── Step 6: Projects ─────────────────────────────────────────────────────
  console.log("[6] Creating 20 projects with milestones...")
  const projectIds: string[] = []
  const managerPool = ["demo-faculty", "demo-employee", ...facultyIds.slice(0, 8)]
  for (let i = 0; i < PROJECTS_DATA.length; i++) {
    const d = PROJECTS_DATA[i]
    const createdAt = monthsAgo(Math.floor(Math.random() * 11) + 1)
    const proj = await prisma.project.upsert({
      where: { id: `demo-proj-${i}` },
      update: { status: d.status },
      create: {
        id: `demo-proj-${i}`,
        titleAr: d.titleAr,
        descriptionAr: d.desc,
        status: d.status,
        managerId: pick(managerPool),
        initiativeId: i < initiativeIds.length ? initiativeIds[i % initiativeIds.length] : undefined,
        budget: d.budget,
        riskLevel: d.risk,
        sdgGoals: d.sdg,
        startDate: createdAt,
        endDate: d.status === "completed" ? daysAgo(Math.floor(Math.random() * 30)) : daysFromNow(Math.floor(Math.random() * 365) + 30),
        createdAt,
      },
    })
    projectIds.push(proj.id)

    // Add milestones
    const milestoneCount = Math.floor(Math.random() * 3) + 2
    for (let m = 0; m < milestoneCount; m++) {
      const milestoneStatus = m < milestoneCount - 1 && d.status === "active" ? "completed" : (d.status === "completed" ? "completed" : "pending")
      await prisma.projectMilestone.upsert({
        where: { id: `demo-proj-${i}-ms-${m}` },
        update: {},
        create: {
          id: `demo-proj-${i}-ms-${m}`,
          projectId: proj.id,
          titleAr: MILESTONE_TITLES[m % MILESTONE_TITLES.length],
          status: milestoneStatus,
          order: m + 1,
          dueDate: daysFromNow((m + 1) * 45),
          completedAt: milestoneStatus === "completed" ? daysAgo(Math.floor(Math.random() * 30)) : undefined,
        },
      })
    }
  }
  console.log(`  ✓ ${projectIds.length} projects with milestones`)

  // ── Step 7: Workflow Instances + Tasks + History ─────────────────────────
  console.log("[7] Creating workflow instances, tasks, and history...")
  const wfDefId = "wf-initiative-approval"

  for (let i = 0; i < 60; i++) {
    const entityId = initiativeIds[i % initiativeIds.length]
    const wfStatus = pick(["APPROVED", "APPROVED", "IN_REVIEW", "PENDING", "REJECTED"])
    const instanceCreatedAt = monthsAgo(Math.floor(Math.random() * 10) + 1)
    const instance = await prisma.workflowInstance.create({
      data: {
        definitionId: wfDefId,
        entityType: "Initiative",
        entityId,
        status: wfStatus as "APPROVED" | "IN_REVIEW" | "PENDING" | "REJECTED",
        initiatorId: pick(ownerPool),
        currentStepId: wfStatus === "IN_REVIEW" ? "step-employee-review" : undefined,
        createdAt: instanceCreatedAt,
        updatedAt: instanceCreatedAt,
      },
    }).catch(() => null)

    if (!instance) continue

    // Approval task
    await prisma.approvalTask.create({
      data: {
        instanceId: instance.id,
        stepId: "step-employee-review",
        stepNameAr: "مراجعة الموظف",
        assigneeType: "role",
        assigneeId: "COMMUNITY_EMPLOYEE",
        status: wfStatus === "PENDING" ? "PENDING" : "COMPLETED",
        dueAt: daysFromNow(3),
        createdAt: instanceCreatedAt,
        updatedAt: instanceCreatedAt,
      },
    })

    // History
    await prisma.workflowHistory.create({
      data: {
        instanceId: instance.id,
        stepId: "step-employee-review",
        stepNameAr: "مراجعة الموظف",
        actorId: "demo-employee",
        action: wfStatus === "REJECTED" ? "REJECT" : wfStatus === "APPROVED" ? "APPROVE" : "SUBMIT",
        comment: wfStatus === "APPROVED" ? "تمت المراجعة والاعتماد" : wfStatus === "REJECTED" ? "يحتاج مراجعة إضافية" : undefined,
        createdAt: new Date(instanceCreatedAt.getTime() + 86400000),
      },
    })
  }

  // Extra approval tasks for settings/workflows page
  for (let i = 0; i < 90; i++) {
    const instanceCreatedAt = monthsAgo(Math.floor(Math.random() * 8) + 1)
    const instance = await prisma.workflowInstance.create({
      data: {
        definitionId: "wf-partnership-approval",
        entityType: "Partnership",
        entityId: `demo-partnership-${i % 18}`,
        status: pick(["PENDING", "IN_REVIEW", "APPROVED"]) as "PENDING" | "IN_REVIEW" | "APPROVED",
        initiatorId: pick(ownerPool),
        createdAt: instanceCreatedAt,
        updatedAt: instanceCreatedAt,
      },
    }).catch(() => null)

    if (!instance) continue

    await prisma.approvalTask.create({
      data: {
        instanceId: instance.id,
        stepId: "step-employee-review",
        stepNameAr: "مراجعة الموظف",
        assigneeType: "role",
        assigneeId: "COMMUNITY_EMPLOYEE",
        status: i % 3 === 0 ? "PENDING" : "COMPLETED",
        dueAt: daysFromNow(Math.floor(Math.random() * 7) + 1),
        createdAt: instanceCreatedAt,
        updatedAt: instanceCreatedAt,
      },
    })
  }
  console.log(`  ✓ Workflow instances, tasks and history created`)

  // ── Step 8: Notifications ─────────────────────────────────────────────────
  console.log("[8] Creating 250 notifications...")
  const notifTypes = ["WORKFLOW_TASK_ASSIGNED", "WORKFLOW_APPROVED", "WORKFLOW_REJECTED", "GENERAL", "REGISTRATION_APPROVED"]
  const notifTitles = [
    { ar: "مهمة جديدة تنتظرك", en: "New task assigned" },
    { ar: "تمت الموافقة على طلبك", en: "Your request was approved" },
    { ar: "تم رفض الطلب", en: "Request rejected" },
    { ar: "إشعار عام من المنصة", en: "Platform notification" },
    { ar: "تم اعتماد حسابك", en: "Account approved" },
  ]
  const recipientPool = ["demo-admin", "demo-manager", "demo-employee", "demo-faculty", "demo-student", ...studentIds.slice(0, 10)]
  for (let i = 0; i < 250; i++) {
    const typeIdx = Math.floor(Math.random() * notifTypes.length)
    const createdAt = monthsAgo(Math.floor(Math.random() * 11))
    createdAt.setDate(Math.floor(Math.random() * 28) + 1)
    await prisma.notification.create({
      data: {
        recipientId: pick(recipientPool),
        type: notifTypes[typeIdx],
        title: notifTitles[typeIdx],
        body: { ar: "يرجى مراجعة المهام المسندة إليك والاطلاع على التفاصيل في المنصة", en: "Please review your assigned tasks and check the details in the platform" },
        channel: "IN_APP",
        status: Math.random() > 0.4 ? "read" : "unread",
        readAt: Math.random() > 0.4 ? daysAgo(Math.floor(Math.random() * 30)) : undefined,
        createdAt,
      },
    })
  }
  console.log(`  ✓ 250 notifications created`)

  // ── Step 9: News Articles ─────────────────────────────────────────────────
  console.log("[9] Creating 30 news articles...")
  const authorPool = ["demo-manager", "demo-employee", ...facultyIds.slice(0, 5)]
  for (let i = 0; i < Math.min(NEWS_DATA.length, 30); i++) {
    const d = NEWS_DATA[i]
    const publishedAt = monthsAgo(Math.floor(Math.random() * 11))
    publishedAt.setDate(Math.floor(Math.random() * 28) + 1)
    await prisma.newsArticle.upsert({
      where: { id: `demo-news-${i}` },
      update: {},
      create: {
        id: `demo-news-${i}`,
        titleAr: d.titleAr,
        excerptAr: d.excerpt,
        contentAr: `${d.excerpt}\n\nتفاصيل إضافية حول هذا الموضوع ستُنشر قريباً. تابعوا منصة المسؤولية المجتمعية لجامعة القصيم للاطلاع على آخر المستجدات والإنجازات.`,
        status: "published",
        publishedAt,
        authorId: pick(authorPool),
        tags: d.tags,
        viewCount: Math.floor(Math.random() * 500) + 20,
        createdAt: publishedAt,
      },
    })
  }
  // Add extra draft articles
  for (let i = 30; i < Math.min(NEWS_DATA.length, 45); i++) {
    const d = NEWS_DATA[i]
    await prisma.newsArticle.upsert({
      where: { id: `demo-news-${i}` },
      update: {},
      create: {
        id: `demo-news-${i}`,
        titleAr: d.titleAr,
        excerptAr: d.excerpt,
        contentAr: d.excerpt,
        status: "draft",
        authorId: pick(authorPool),
        tags: d.tags,
        createdAt: daysAgo(Math.floor(Math.random() * 30) + 1),
      },
    })
  }
  console.log(`  ✓ ${Math.min(NEWS_DATA.length, 45)} news articles created`)

  // ── Step 10: CMS Events ───────────────────────────────────────────────────
  console.log("[10] Creating 30 CMS events...")
  for (let i = 0; i < Math.min(CMS_EVENTS_DATA.length, 30); i++) {
    const d = CMS_EVENTS_DATA[i]
    const isUpcoming = i < 15
    const startDate = isUpcoming
      ? daysFromNow(Math.floor(Math.random() * 120) + 5)
      : daysAgo(Math.floor(Math.random() * 180) + 5)
    const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 5) + 1) * 86400000)
    await prisma.cMSEvent.upsert({
      where: { id: `demo-event-${i}` },
      update: {},
      create: {
        id: `demo-event-${i}`,
        titleAr: d.titleAr,
        descriptionAr: d.desc,
        startDate,
        endDate,
        locationAr: d.location,
        status: "published",
        capacity: d.capacity,
        registrations: Math.floor(d.capacity * (Math.random() * 0.7)),
        isPublic: true,
        createdAt: daysAgo(Math.floor(Math.random() * 60) + 10),
      },
    })
  }
  console.log(`  ✓ ${Math.min(CMS_EVENTS_DATA.length, 30)} events created`)

  // ── Final count ───────────────────────────────────────────────────────────
  const [uCount, iCount, prCount, paCount, nCount] = await Promise.all([
    prisma.user.count(),
    prisma.initiative.count(),
    prisma.project.count(),
    prisma.partnership.count(),
    prisma.notification.count(),
  ])

  console.log(`
✅ Demo data seeded successfully!
   Users:           ${uCount}
   Initiatives:     ${iCount}
   Projects:        ${prCount}
   Partnerships:    ${paCount}
   Notifications:   ${nCount}
  `)
}

const SDG_GOALS_TAGS: Record<number, string> = {
  1: "مكافحة الفقر", 2: "الأمن الغذائي", 3: "الصحة", 4: "التعليم",
  5: "المساواة", 6: "المياه", 7: "الطاقة", 8: "العمل", 9: "الابتكار",
  10: "تقليص الفوارق", 11: "المدن المستدامة", 12: "الاستهلاك المسؤول",
  13: "المناخ", 14: "المحيطات", 15: "البيئة البرية", 16: "السلام", 17: "الشراكات",
}

const MILESTONE_TITLES = [
  "مرحلة التخطيط والدراسة",
  "تجهيز الموارد والفريق",
  "التنفيذ الميداني",
  "المتابعة والتقييم",
  "إعداد التقرير النهائي",
]

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
