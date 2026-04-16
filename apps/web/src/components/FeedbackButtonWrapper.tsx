"use client";
import { usePathname } from "next/navigation";
import FeedbackButton from "./FeedbackButton";

// An tren cac trang co chat/input de khong che noi dung
const HIDDEN_PATHS = ["/", "/tutor", "/call", "/homework"];

export default function FeedbackButtonWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  return <FeedbackButton />;
}
