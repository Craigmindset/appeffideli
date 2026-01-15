import { redirect } from "next/navigation";

export default function AdminPage() {
  // Redirect to login - admin routes should be accessed through their specific paths
  redirect("/login?redirectedFrom=/admin");
}
