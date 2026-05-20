import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOperatorChecklist,
  getOperatorChecklists,
  getOperatorSubmittedChecklist,
  getOperatorSubmittedChecklists,
  submitChecklistEntry,
  updateChecklistEntry,
} from '../../../core/api/operator';

export function useOperatorChecklists(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['operator', 'checklists', queryParams],
    queryFn: () => getOperatorChecklists(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useOperatorChecklist(checklistId, options = {}) {
  return useQuery({
    queryKey: ['operator', 'checklists', checklistId],
    queryFn: () => getOperatorChecklist(checklistId),
    enabled: Boolean(checklistId),
    ...options,
  });
}

export function useOperatorSubmittedChecklists(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['operator', 'checklists', 'submissions', queryParams],
    queryFn: () => getOperatorSubmittedChecklists(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useOperatorSubmittedChecklist(checklistId, options = {}) {
  return useQuery({
    queryKey: ['operator', 'checklists', 'submissions', checklistId],
    queryFn: () => getOperatorSubmittedChecklist(checklistId),
    enabled: Boolean(checklistId),
    ...options,
  });
}

export function useCreateOperatorChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ payload }) => submitChecklistEntry(checklistId, payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['operator', 'checklists', 'entries', checklistId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['operator', 'checklists', 'entries'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['operator', 'checklists'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['user', 'analytics'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateOperatorChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ payload }) => updateChecklistEntry(checklistId, payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['operator', 'checklists', 'entries', checklistId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['operator', 'checklists', 'submissions', checklistId],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
