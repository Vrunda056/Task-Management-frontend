import type { Metadata } from "next";
import { Providers } from "./providers";
import { WorkspaceShell } from "./workspace-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskly — Personal workspace",
  description: "Create projects, manage tasks, and plan your day.",
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