import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartment,
  fetchDepartments,
  restoreDepartment,
  updateDepartment,
} from '../../../core/api/superadmin';

export function useDepartments(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'departments', queryParams],
    queryFn: () => fetchDepartments(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useDepartmentsInfinite(queryParams = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: ['superadmin', 'departments', 'infinite', queryParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchDepartments({ ...queryParams, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    ...options,
  });
}

export function useDepartment(departmentId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'departments', departmentId],
    queryFn: () => fetchDepartment(departmentId),
    enabled: Boolean(departmentId),
    ...options,
  });
}

export function useDeleteDepartment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ departmentId }) => deleteDepartment(departmentId),
    onSuccess: async (response, variables, context) => {
      const { departmentId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'departments'],
      });

      // Also remove the individual department query if it exists
      if (departmentId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'departments', departmentId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useRestoreDepartment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ departmentId }) => restoreDepartment(departmentId),
    onSuccess: async (response, variables, context) => {
      const { departmentId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'departments'],
      });

      // Also remove the individual department query if it exists
      if (departmentId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'departments', departmentId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUpdateDepartment(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ departmentId, payload }) =>
      updateDepartment(payload, departmentId),
    onSuccess: async (response, variables, context) => {
      const { departmentId } = variables; // clean and direct

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'departments'],
      });

      if (departmentId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'departments', departmentId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateDepartments(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => createDepartment(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'departments'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
