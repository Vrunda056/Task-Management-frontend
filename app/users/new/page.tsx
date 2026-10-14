import { NewUserForm } from "../new-user-form";

export default function NewUserPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Create user</h1>
        <p className="mt-2 text-gray-600">
          Enter a name and email address to create a user.
        </p>
      </header>
      <NewUserForm />
    </main>
  );
}
