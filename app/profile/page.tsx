import type { Metadata } from "next";
import { ProfilePage } from "./profile-page";

export const metadata: Metadata = {
  title: "My Profile | Taskly",
  description: "View your Taskly account and profile details.",
};

export default function MyProfilePage() {
  return <ProfilePage />;
}
