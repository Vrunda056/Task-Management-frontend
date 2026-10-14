import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import { deleteUser, getUsers, updateUser, createUser } from "./user.api";
import type { UpdateUserInput } from "./user.schema";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: getUsers });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}


export function useUpdateUser() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
