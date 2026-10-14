import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20">
        <header className="flex items-center justify-between">
          <Link className="text-lg font-semibold tracking-tight" href="/">
              Task Management 
          </Link>
          <Link
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
            href="/users"
          >
            Users
          </Link>
        </header>

        <section className="grid items-center gap-12 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
              Task Management System
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              A clearer way to organize your work.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Build your workspace one step at a time. Start by managing the
              people you work with.
            </p>
            <Link
              className="mt-8 inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-indigo-800"
              href="/users"
            >
              Manage users
              <span aria-hidden="true" className="ml-2">
                →
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 font-semibold text-indigo-800">
                S
              </div>
              <div>
                <p className="font-semibold">Your workspace</p>
                <p className="mt-1 text-sm text-slate-500">
                  A simple place to get started
                </p>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                CURRENT MODULE
              </p>
              <p className="mt-2 text-xl font-semibold">People</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add teammates, keep their contact details current, and manage
                workspace positions.
              </p>
              <Link
                className="mt-5 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                href="/users"
              >
                Go to users <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-6 text-sm text-slate-500">
          Workspace
        </footer>
      </div>
    </main>
  );
}
