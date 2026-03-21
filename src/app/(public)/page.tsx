/**
 * This page is shadowed by src/app/page.tsx which has priority for the "/" route.
 * The redirect below satisfies Next.js type requirements but is never reached in practice.
 */
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/portfolio");
}
