import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  deleteRole,
  fetchRole,
  fetchRoles,
  updateRole,
} from '../../../core/api/superadmin';

export function useRoles(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'roles'],
    queryFn: fetchRoles,
    ...options,
  });
}

export function useRole(roleId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'roles', roleId],
    queryFn: () => fetchRole(roleId),
    enabled: Boolean(roleId),
    ...options,
  });
}

export function useDeleteRole(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ roleId }) => deleteRole(roleId),
    onSuccess: async (response, variables, context) => {
      const { roleId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'roles'],
      });

      // Also remove the individual role query if it exists
      if (roleId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'roles', roleId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateRole(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ roleId, payload }) => updateRole(payload, roleId),
    onSuccess: async (response, variables, context) => {
      const { roleId } = variables; // clean and direct

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'roles'],
      });

      if (roleId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'roles', roleId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateRoles(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createRole(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'roles'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
