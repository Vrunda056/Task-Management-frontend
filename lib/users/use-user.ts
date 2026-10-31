import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import {
  createUser,
  deleteUser,
  getMyProfile,
  getUsers,
  updateMyProfile,
  updateUser,
} from "./user.api";
import type {
  CreateUserInput,
  UpdateProfileInput,
  UpdateUserInput,
  UserResponse,
} from "./user.schema";
import { useAuth } from "../auth/auth-context";
import { getAuthSession, setAuthSession } from "../auth/auth-session";

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

export function useMyProfile() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => getMyProfile(accessToken),
    enabled: accessToken !== null,
  });
}

export function useUpdateMyProfile() {
  const { accessToken } = useAuth();
  return useMutation<UserResponse, Error, UpdateProfileInput>({
    mutationFn: (input) => updateMyProfile(input, accessToken),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });

      // Synchronize in-memory and persisted auth session
      const currentSession = getAuthSession();
      if (currentSession) {
        setAuthSession({
          ...currentSession,
          user: updatedUser,
        });
      }
    },
  });
}
