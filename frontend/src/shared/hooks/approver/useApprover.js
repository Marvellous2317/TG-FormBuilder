import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveChecklistEntry,
  getApproverSubmittedChecklist,
  getApproverSubmittedChecklists,
  getApproverSubmittedChecklistsHistory,
  rejectChecklistEntry,
  uploadSignature,
} from '../../../core/api/approver';

export function useApproverChecklists(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['approver', 'checklists', queryParams],
    queryFn: () => getApproverSubmittedChecklists(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useApproverChecklistsHistory(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['approver', 'checklists', 'history', queryParams],
    queryFn: () => getApproverSubmittedChecklistsHistory(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useApproverChecklist(checklistId, options = {}) {
  return useQuery({
    queryKey: ['approver', 'checklists', checklistId],
    queryFn: () => getApproverSubmittedChecklist(checklistId),
    enabled: Boolean(checklistId),
    ...options,
  });
}

export function useApproverApproveChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => approveChecklistEntry(checklistId, payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['approver', 'checklists'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['approver', 'checklists', checklistId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['approver', 'checklists', 'history'],
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

export function useApproverRejectChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: () => rejectChecklistEntry(checklistId),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['approver', 'checklists', checklistId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['approver', 'checklists', 'history'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useApproverSignature(options = {}) {
  const { onSuccess, ...mutationOptions } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => uploadSignature(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['user', 'profile'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
