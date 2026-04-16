import AppLayoutClient from "../../components/AppLayoutClient";
import FeedbackButtonWrapper from "../../components/FeedbackButtonWrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayoutClient>
      {children}
      <FeedbackButtonWrapper />
    </AppLayoutClient>
  );
}
