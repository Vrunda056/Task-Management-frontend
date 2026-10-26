import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import { deleteUser, getUsers, updateUser, createUser } from "./user.api";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
} from "./user.schema";
import { useAuth } from "../auth/auth-context";

export function useUsers() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(accessToken),
    enabled: accessToken !== null,
  });
}

export function useCreateUser() {
  const { accessToken } = useAuth();
  return useMutation<UserResponse, Error, CreateUserInput>({
    mutationFn: (input) => createUser(input, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}


export function useUpdateUser() {
  const { accessToken } = useAuth();
  return useMutation<
    UserResponse,
    Error,
    { id: string; input: UpdateUserInput }
  >({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const { accessToken } = useAuth();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteUser(id, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
