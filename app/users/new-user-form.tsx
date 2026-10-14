// "use client";

// import { useState, type ChangeEvent, type FormEvent } from "react";
// import {
//   createUserSchema,
//   type CreateUserInput,
// } from "@/lib/users/user.schema";
// import { useCreateUser } from "@/lib/users/use-create-user";

// export function NewUserForm() {
//   const [form, setForm] = useState<CreateUserInput>({ name: "", email: "" });
//   const [validationMessage, setValidationMessage] = useState<string | null>(
//     null,
//   );
//   const createUserMutation = useCreateUser();

//   function handleChange(event: ChangeEvent<HTMLInputElement>) {
//     const { name, value } = event.target;
//     if (name === "name" || name === "email") {
//       setForm((current) => ({ ...current, [name]: value }));
//       setValidationMessage(null);
//       createUserMutation.reset();
//     }
//   }

//   function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setValidationMessage(null);

//     const input = createUserSchema.safeParse(form);
//     if (!input.success) {
//       setValidationMessage(
//         input.error.issues[0]?.message ?? "Please check the form fields.",
//       );
//       return;
//     }

//     createUserMutation.mutate(input.data, {
//       onSuccess: () => setForm({ name: "", email: "" }),
//     });
//   }

//   return (
//     <form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
//       <label className="flex flex-col gap-1">
//         <span>Name</span>
//         <input
//           autoComplete="name"
//           className="rounded border border-gray-300 px-3 py-2"
//           maxLength={100}
//           name="name"
//           onChange={handleChange}
//           required
//           value={form.name}
//         />
//       </label>

//       <label className="flex flex-col gap-1">
//         <span>Email</span>
//         <input
//           autoComplete="email"
//           className="rounded border border-gray-300 px-3 py-2"
//           maxLength={254}
//           name="email"
//           onChange={handleChange}
//           required
//           type="email"
//           value={form.email}
//         />
//       </label>

//       <button
//         className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-60"
//         disabled={createUserMutation.isPending}
//         type="submit"
//       >
//         {createUserMutation.isPending ? "Creating…" : "Create user"}
//       </button>

//       <div aria-live="polite">
//         {validationMessage && <p role="alert">{validationMessage}</p>}
//         {createUserMutation.error && (
//           <p role="alert">{createUserMutation.error.message}</p>
//         )}
//         {createUserMutation.data && (
//           <p role="status">
//             Created {createUserMutation.data.name} (
//             {createUserMutation.data.email}).
//           </p>
//         )}
//       </div>
//     </form>
//   );
// }


"use client";

import { useState, type FormEvent } from "react";
import { createUserSchema } from "@/lib/users/user.schema";
import { useCreateUser } from "@/lib/users/use-create-user";

export function NewUserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const createUser = useCreateUser();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const result = createUserSchema.safeParse({ name, email });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    createUser.mutate(result.data, {
      onSuccess: () => {
        setName("");
        setEmail("");
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating..." : "Create user"}
      </button>

      {error && <p>{error}</p>}
      {createUser.error && <p>{createUser.error.message}</p>}

      {createUser.data && (
        <p>
          Created {createUser.data.name} ({createUser.data.email}).
        </p>
      )}
    </form>
  );
}