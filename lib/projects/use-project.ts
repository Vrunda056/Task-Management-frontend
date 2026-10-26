import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import { deleteProject, getProjects, updateProject, createProject } from "./project.api";
import type {
  CreateProjectInput,
  ProjectResponse,
  UpdateProjectInput,
} from "./project.schema";
import { useAuth } from "../auth/auth-context";

export function useProjects() {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(accessToken),
    enabled: accessToken !== null,
  });
}

export function useCreateProject() {
  const { accessToken } = useAuth();
  return useMutation<ProjectResponse, Error, CreateProjectInput>({
    mutationFn: (input) => createProject(input, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const { accessToken } = useAuth();
  return useMutation<
    ProjectResponse,
    Error,
    { id: string; input: UpdateProjectInput }
  >({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      updateProject(id, input, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const { accessToken } = useAuth();
  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteProject(id, accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}
