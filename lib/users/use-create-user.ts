import { useMutation } from "@tanstack/react-query";
import { createUser } from "./user.api";

export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
  });
}
