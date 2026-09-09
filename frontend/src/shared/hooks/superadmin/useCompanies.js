import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  activateCompany,
  createCompany,
  deleteCompany,
  fetchCompanies,
  fetchCompany,
  fetchCompanyAnalytics,
  fetchDashboardCompanyAdoptionAnalytics,
  fetchDashboardCompanyAnalytics,
  fetchSuperAdminSubmission,
  fetchSuperAdminSubmissions,
  restoreCompany,
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

export function useCompaniesInfinite(queryParams = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: ['superadmin', 'companies', 'infinite', queryParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchCompanies({ ...queryParams, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
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

export function useSuperAdminSubmissions(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'submissions', queryParams],
    queryFn: () => fetchSuperAdminSubmissions(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useSuperAdminSubmission(submissionId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'submissions', submissionId],
    queryFn: () => fetchSuperAdminSubmission(submissionId),
    enabled: Boolean(submissionId),
    ...options,
  });
}

export function useDashboardCompanyAnalytics(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'companies', 'dashboard', 'analytics'],
    queryFn: () => fetchDashboardCompanyAnalytics(),
    keepPreviousData: true,
    ...options,
  });
}

export function useDashboardCompanyAdoptionAnalytics(
  queryParams,
  options = {},
) {
  return useQuery({
    queryKey: ['superadmin', 'companies', 'dashboard', 'adoption', 'analytics'],
    queryFn: () => fetchDashboardCompanyAdoptionAnalytics(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useCompanyAnalytics(companyId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'companies', 'analytics', companyId],
    queryFn: () => fetchCompanyAnalytics(companyId),
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

export function useRestoreCompany(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ companyId }) => restoreCompany(companyId),
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
