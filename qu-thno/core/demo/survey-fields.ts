// Short, generic beneficiary satisfaction survey — modeled on the
// reference "استبانة رضا المستفيدين" pattern (a few Likert ratings + an
// open suggestion), applicable after any demo service is marked completed
// rather than a 35-question training-specific evaluation.
export const SURVEY_LIKERT = [
  { value: "5", label: "موافق بشدة" },
  { value: "4", label: "موافق" },
  { value: "3", label: "محايد" },
  { value: "2", label: "غير موافق" },
  { value: "1", label: "غير موافق بشدة" },
]

export const SURVEY_QUESTIONS = [
  { name: "q_organized", label: "كانت الخدمة منظّمة بشكل جيد" },
  { name: "q_value", label: "كانت الخدمة مفيدة وذات قيمة" },
  { name: "q_ease", label: "كانت تجربة التقديم عبر المنصة سهلة" },
  { name: "q_recommend", label: "أنصح الآخرين بالاستفادة من هذه الخدمة" },
]
