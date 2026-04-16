import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateCompany,
  createCompany,
  deleteCompany,
  fetchCompanies,
  fetchCompany,
  suspendCompany,
  updateCompany,
} from '../../../core/api/superadmin';

export function useCompanies(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'companies', queryParams],
    queryFn: () => fetchCompanies(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useCompany(companyId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'companies', companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: Boolean(companyId),
    ...options,
  });
}

export function useUpdateCompany(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ companyId, payload }) => updateCompany(companyId, payload),
    onSuccess: async (response, variables, context) => {
      const companyId =
        variables?.companyId ??
        variables?.id ??
        response?.data?.companyId ??
        response?.data?.data?.companyId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'companies'],
      });

      if (companyId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'companies', companyId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useDeleteCompany(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ companyId }) => deleteCompany(companyId),
    onSuccess: async (response, variables, context) => {
      const { companyId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'companies'],
      });

      // Also remove the individual company query if it exists
      if (companyId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'companies', companyId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateCompanies(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createCompany(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'companies'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useSuspendCompany(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ companyId, payload }) => suspendCompany(companyId, payload),
    onSuccess: async (response, variables, context) => {
      const companyId =
        variables?.companyId ??
        variables?.id ??
        response?.data?.companyId ??
        response?.data?.data?.companyId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'companies'],
      });

      if (companyId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'companies', companyId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useActivateCompany(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ companyId, payload }) => activateCompany(companyId, payload),
    onSuccess: async (response, variables, context) => {
      const companyId =
        variables?.companyId ??
        variables?.id ??
        response?.data?.companyId ??
        response?.data?.data?.companyId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'companies'],
      });

      if (companyId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'companies', companyId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
