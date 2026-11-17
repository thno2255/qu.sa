import { Rocket, Handshake, GraduationCap, Calendar, Award, type LucideIcon } from "lucide-react"

export interface DemoService {
  slug: string
  titleAr: string
  descAr: string
  Icon: LucideIcon
}

export const DEMO_SERVICES: DemoService[] = [
  {
    slug: "initiatives",
    titleAr: "تقديم مبادرة مجتمعية",
    descAr: "اقترح مبادرة مجتمعية جديدة تخدم الجامعة والمجتمع المحيط بها",
    Icon: Rocket,
  },
  {
    slug: "partnerships",
    titleAr: "طلب شراكة استراتيجية",
    descAr: "تقدّم بطلب لبناء شراكة مؤسسية مع جامعة القصيم",
    Icon: Handshake,
  },
  {
    slug: "consultations",
    titleAr: "طلب استشارة",
    descAr: "اطلب استشارة أكاديمية أو مجتمعية من عضو هيئة تدريس",
    Icon: GraduationCap,
  },
  {
    slug: "events",
    titleAr: "طلب إقامة فعالية",
    descAr: "تقدّم بطلب لإقامة فعالية بالتعاون مع الجامعة",
    Icon: Calendar,
  },
  {
    slug: "training",
    titleAr: "طلب استشارة تدريبية",
    descAr: "تطلب جهتك استشارة تدريبية لرفع كفاءتها المؤسسية، دون الحاجة لبرنامج تدريبي كامل",
    Icon: Award,
  },
]

export function getDemoService(slug: string): DemoService | undefined {
  return DEMO_SERVICES.find((s) => s.slug === slug)
}
