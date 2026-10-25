"use client";

import { useState, type FormEvent } from "react";
import {
  createUserSchema,
  updateUserSchema,
  type UserResponse,
} from "@/lib/users/user.schema";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/lib/users/use-user";

function UserForm({
  user,
  onCancel,
}: {
  user?: UserResponse;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [position, setPosition] = useState(user?.position ?? "");
  const [validationError, setValidationError] = useState("");
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const mutation = user ? updateMutation : createMutation;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (user) {
      const result = updateUserSchema.safeParse({ name, email, position });
      if (!result.success) {
        setValidationError(
          result.error.issues[0]?.message ?? "Please check the form fields.",
        );
        return;
      }
      updateMutation.mutate(
        { id: user.id, input: result.data },
        { onSuccess: onCancel },
      );
      return;
    }

    const result = createUserSchema.safeParse({ name, email, position });
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Please check the form fields.",
      );
      return;
    }
    createMutation.mutate(result.data, {
      onSuccess: () => {
        setName("");
        setEmail("");
        setPosition("");
      },
    });
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-sm font-medium">
        Name
        <input
          autoComplete="name"
          className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Email
        <input
          autoComplete="email"
          className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
          maxLength={254}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Position
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 font-normal"
          maxLength={100}
          onChange={(event) => setPosition(event.target.value)}
          required
          value={position}
        />
      </label>
      <div className="flex items-end gap-2">
        <button
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending
            ? user
              ? "Saving..."
              : "Creating..."
            : user
              ? "Save changes"
              : "Create user"}
        </button>
        {user && (
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
      </div>
      {(validationError || mutation.error) && (
        <p className="text-sm text-red-700 sm:col-span-2" role="alert">
          {validationError || mutation.error?.message}
        </p>
      )}
      {createMutation.data && !user && (
        <p className="text-sm text-green-700 sm:col-span-2" role="status">
          Created {createMutation.data.name}.
        </p>
      )}
    </form>
  );
}

export function UserManagement() {
  const users = useUsers();
  const deleteMutation = useDeleteUser();
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="projects-header">
        <div>
          <h1 className="projects-title">People</h1>
          <p className="projects-subtitle">
            Manage the people and positions in your workspace.
          </p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="section-heading mb-5">
          {editingUser ? `Edit ${editingUser.name}` : "Add a user"}
        </h2>
        {editingUser ? (
          <UserForm
            key={editingUser.id}
            user={editingUser}
            onCancel={() => setEditingUser(null)}
          />
        ) : (
          <UserForm />
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="section-heading">All users</h2>
          {users.data && (
            <span className="text-sm text-slate-500">
              {users.data.length} {users.data.length === 1 ? "user" : "users"}
            </span>
          )}
        </div>

        {users.isPending && <p role="status">Loading users...</p>}
        {users.isError && (
          <p className="text-red-700" role="alert">
            Could not load users: {users.error.message}
          </p>
        )}
        {users.data?.length === 0 && (
          <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-slate-600">
            No users yet. Add the first user above.
          </p>
        )}
        {users.data && users.data.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {users.data.map((user) => (
              <li
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                key={user.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="text-sm text-slate-500">{user.position}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                    onClick={() => setEditingUser(user)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(user.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {deleteMutation.isError && (
          <p className="mt-4 text-sm text-red-700" role="alert">
            Could not delete user: {deleteMutation.error.message}
          </p>
        )}
        {deleteMutation.isSuccess && (
          <p className="mt-4 text-sm text-green-700" role="status">
            User deleted.
          </p>
        )}
      </section>
    </div>
  );
}
