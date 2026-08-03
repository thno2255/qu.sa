import { redirect } from "next/navigation"

export default function ProjectVisitsRedirect() {
  redirect("/consultations?tab=visits")
}
