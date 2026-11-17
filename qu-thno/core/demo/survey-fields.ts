// Mirrors the official "استبانة قياس رضا المستفيدين عن الفعاليات المجتمعية"
// (الإدارة العامة للشراكة المجتمعية) — same 5-point scale, respondent
// categories, and statement wording, generalized from "الفعالية" to
// "الخدمة" so the one survey applies after any demo service (not only
// events) is marked completed.
export const SURVEY_LIKERT = [
  { value: "1", label: "لا أوافق إطلاقاً" },
  { value: "2", label: "لا أوافق" },
  { value: "3", label: "محايد" },
  { value: "4", label: "أوافق" },
  { value: "5", label: "أوافق بشدة" },
]

export const SURVEY_CATEGORIES = ["زائر عام", "طالب", "منسوب جامعة", "ممثل جهة"]

export const SURVEY_QUESTIONS = [
  { name: "q_clear", label: "الخدمة المقدَّمة كانت واضحة ومفيدة لي." },
  { name: "q_team", label: "كان فريق العمل متعاوناً ومتمكناً." },
  { name: "q_awareness", label: "زادت معرفتي بدور جامعة القصيم في خدمة المجتمع." },
  { name: "q_recommend", label: "أنصح غيري بالاستفادة من خدمات الإدارة العامة للشراكة المجتمعية." },
  { name: "q_overall", label: "بشكل عام، أنا راضٍ عن الخدمة المقدَّمة." },
]
