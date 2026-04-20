import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createChecklist,
  deleteChecklist,
  fetchChecklist,
  fetchChecklists,
  updateChecklist,
} from '../../../core/api/admin';

export function useChecklists(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'checklists'],
    queryFn: fetchChecklists,
    ...options,
  });
}

export function useChecklist(checklistId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'checklists', checklistId],
    queryFn: () => fetchChecklist(checklistId),
    enabled: Boolean(checklistId),
    ...options,
  });
}

export function useDeleteChecklist(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ checklistId }) => deleteChecklist(checklistId),
    onSuccess: async (response, variables, context) => {
      const { checklistId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'checklists'],
      });

      // Also remove the individual checklist query if it exists
      if (checklistId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'checklists', checklistId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateChecklist(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ checklistId, payload }) =>
      updateChecklist(payload, checklistId),
    onSuccess: async (response, variables, context) => {
      const { checklistId } = variables; // clean and direct

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'checklists'],
      });

      if (checklistId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'checklists', checklistId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateChecklists(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createChecklist(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'checklists'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
