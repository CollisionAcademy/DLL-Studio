import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  path: "/signup",
  title: "Parent sign-in",
  description: "Parent and guardian accounts for DLL Studio.",
  index: false,
});

export default function Signup() {
  redirect("/login");
}
