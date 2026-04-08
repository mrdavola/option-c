// Legacy route. The dashboard moved to /learner. Redirect anyone who
// hits the old URL.
import { redirect } from "next/navigation"

export default function StudentRedirect() {
  redirect("/learner")
}
