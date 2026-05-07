import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignChecklistOperator,
  createChecklist,
  createChecklistCatalog,
  createChecklistEntries,
  deleteChecklist,
  deleteChecklistCatalog,
  deleteChecklistEntries,
  fetchChecklist,
  fetchChecklistCatalog,
  fetchChecklistCatalogs,
  fetchChecklists,
  fetchChecklistsAnalytics,
  fetchChecklistsEntries,
  unAssignChecklistOperator,
  updateChecklist,
  updateChecklistCatalog,
  updateChecklistEntries,
} from '../../../core/api/admin';

export function useChecklists(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', queryParams],
    queryFn: () => fetchChecklists(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useChecklistsAnalytics(options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', 'analytics'],
    queryFn: fetchChecklistsAnalytics,
    ...options,
  });
}

export function useChecklist(checklistId, options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', checklistId],
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
        queryKey: ['admin', 'checklists'],
      });

      // Also remove the individual checklist query if it exists
      if (checklistId) {
        queryClient.removeQueries({
          queryKey: ['admin', 'checklists', checklistId],
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
        queryKey: ['admin', 'checklists'],
      });

      if (checklistId) {
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'checklists', checklistId],
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
        queryKey: ['admin', 'checklists'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useDeleteChecklistEntries(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (entryId) => deleteChecklistEntries(entryId),
    onSuccess: async (response, variables, context) => {
      const { checklistId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'entries', checklistId],
      });

      // Also remove the individual checklist query if it exists
      if (checklistId) {
        queryClient.removeQueries({
          queryKey: ['admin', 'checklists', 'entries', checklistId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useChecklistEntries(checklistId, options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', 'entries', checklistId],
    queryFn: () => fetchChecklistsEntries(checklistId),
    enabled: Boolean(checklistId),
    ...options,
  });
}

export function useCreateChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createChecklistEntries(checklistId, payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'entries', checklistId],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateChecklistEntries(checklistId, options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => updateChecklistEntries(checklistId, payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'entries', checklistId],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useChecklistCatalogs(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', 'catalogs', queryParams],
    queryFn: () => fetchChecklistCatalogs(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useChecklistCatalog(catalogId, options = {}) {
  return useQuery({
    queryKey: ['admin', 'checklists', 'catalogs', catalogId],
    queryFn: () => fetchChecklistCatalog(catalogId),
    enabled: Boolean(catalogId),
    ...options,
  });
}

export function useDeleteChecklistCatalogs(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ catalogId }) => deleteChecklistCatalog(catalogId),
    onSuccess: async (response, variables, context) => {
      const { catalogId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'catalogs'],
      });

      // Also remove the individual checklist query if it exists
      if (catalogId) {
        queryClient.removeQueries({
          queryKey: ['admin', 'checklists', 'catalogs', catalogId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateChecklistCatalogs(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ catalogId, payload }) =>
      updateChecklistCatalog(payload, catalogId),
    onSuccess: async (response, variables, context) => {
      const { catalogId } = variables; // clean and direct

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'catalogs'],
      });

      if (catalogId) {
        await queryClient.invalidateQueries({
          queryKey: ['admin', 'checklists', 'catalogs', catalogId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateChecklistCatalogs(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createChecklistCatalog(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'catalogs'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useAssignChecklistOperator(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => assignChecklistOperator(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'entries'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUnassignChecklistOperator(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => unAssignChecklistOperator(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists', 'entries'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['admin', 'checklists'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
