import AppLayoutClient from "../../components/AppLayoutClient";
import FeedbackButton from "../../components/FeedbackButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayoutClient>
      {children}
      <FeedbackButton />
    </AppLayoutClient>
  );
}
