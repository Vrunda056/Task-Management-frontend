"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock3,
  FolderKanban,
  ListChecks,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/auth-context";

const features = [
  {
    icon: FolderKanban,
    title: "Projects in one place",
    description: "Keep work organized around the projects your team is moving forward.",
  },
  {
    icon: ListChecks,
    title: "Tasks with clear next steps",
    description: "Break each day into focused tasks, deliverables, and progress.",
  },
  {
    icon: Clock3,
    title: "Time you can understand",
    description: "Plan your effort and track time as work gets done.",
  },
  {
    icon: UsersRound,
    title: "A shared workspace",
    description: "See the people and work that bring your projects together.",
  },
];

const workflowSteps = [
  {
    icon: FolderKanban,
    step: "01",
    title: "Create a project",
    description: "Give a goal and its work one clear home.",
  },
  {
    icon: ListChecks,
    step: "02",
    title: "Plan the tasks",
    description: "Turn the project into manageable next steps.",
  },
  {
    icon: Clock3,
    step: "03",
    title: "Track your time",
    description: "Understand the effort behind your work.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const loginDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = loginDialogRef.current;
    if (isLoginOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [isLoginOpen]);

  function closeLogin() {
    loginDialogRef.current?.close();
    setIsLoginOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link aria-label="Taskly home" className="login-brand" href="/login">
          <span aria-hidden="true" className="login-brand-mark">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>taskly<span className="login-brand-period">.</span></span>
        </Link>
        <div className="login-header-actions">
          <span className="login-header-note">
            Your work, thoughtfully organized
          </span>
          <button
            className="login-header-button"
            onClick={() => setIsLoginOpen(true)}
            type="button"
          >
            Sign in <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="login-layout">
        <section aria-labelledby="project-heading" className="login-intro">
          <div className="login-eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            THE SPACE WHERE WORK COMES TOGETHER
          </div>
          <h1 id="project-heading">
            Turn big ideas
            <br />
            <span>into daily progress.</span>
          </h1>
          <p className="login-lead">
            Projects, tasks, and time—connected in one workspace. Taskly gives
            your team a simple way to see what matters, what comes next, and how
            the day is taking shape.
          </p>

          <div aria-label="How Taskly helps you organize work" className="login-workflow">
            <div className="login-workflow-heading">
              <span>HOW TASKLY WORKS</span>
              <span>From idea to done</span>
            </div>
            <div className="login-workflow-steps">
              {workflowSteps.map(({ icon: Icon, step, title, description }) => (
                <article className="login-workflow-step" key={step}>
                  <div className="login-workflow-step-top">
                    <span className="login-workflow-icon">
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="login-workflow-number">{step}</span>
                  </div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>

          <div aria-label="What you can do with Taskly" className="login-features">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="login-feature" key={title}>
                <span className="login-feature-icon">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="login-note">
            <span className="login-note-check">
              <Check size={14} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <p>Plan the day. See the progress. Keep the momentum.</p>
          </div>

          <div className="login-hero-actions">
            <button
              className="login-primary-cta"
              onClick={() => setIsLoginOpen(true)}
            >
              Open your workspace
              <span><ArrowRight size={17} aria-hidden="true" /></span>
            </button>
            <p>Already invited? Sign in with your account.</p>
          </div>

        </section>
      </div>

      <footer className="login-footer">
        <span>One calm place to move work forward.</span>
        <span>Projects <i /> Tasks <i /> Time</span>
      </footer>

      <dialog
        aria-labelledby="login-heading"
        className="login-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeLogin();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeLogin();
          }
        }}
        onClose={() => setIsLoginOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeLogin();
          }
        }}
        ref={loginDialogRef}
      >
        <section className="login-panel">
          <button
            aria-label="Close sign in"
            className="login-dialog-close"
            onClick={closeLogin}
            type="button"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <div className="login-panel-top">
            <span className="login-panel-icon">
              <ArrowRight size={19} strokeWidth={2} aria-hidden="true" />
            </span>
            <p>Welcome back</p>
          </div>
          <h2 id="login-heading">Sign in to Taskly</h2>
          <p className="login-panel-description">
            Enter your account details to open your workspace.
          </p>

          {authError && (
            <p className="auth-error" role="alert">
              {authError}
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email address</span>
              <input
                autoComplete="username"
                autoFocus
                className="auth-input"
                maxLength={254}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                autoComplete="current-password"
                className="auth-input"
                maxLength={128}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" disabled={isSubmitting} type="submit">
              <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
              {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
            </button>
          </form>

          <p className="login-panel-footnote">
            Need access? Ask your workspace administrator for an invitation.
          </p>
        </section>
      </dialog>
    </main>
  );
}
