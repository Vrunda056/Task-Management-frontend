import type { Metadata } from "next";
import { Providers } from "./providers";
import { WorkspaceShell } from "./workspace-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskly — Projects, tasks, and time in one workspace",
  description:
    "Organize projects, plan daily tasks, and track time in your Taskly workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WorkspaceShell>{children}</WorkspaceShell>
        </Providers>
      </body>
    </html>
  );
}