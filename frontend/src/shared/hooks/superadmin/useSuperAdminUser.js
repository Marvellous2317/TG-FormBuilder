import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addUser,
  assignApproverToOperator,
  deleteUser,
  fetchuser,
  fetchUsers,
  fetchUserStatistics,
  unassignApproverToOperator,
  updateUser,
} from '../../../core/api/superadmin';

export function useFetchUsers(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', queryParams],
    queryFn: () => fetchUsers(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useFetchUsersInfinite(queryParams = {}, options = {}) {
  return useInfiniteQuery({
    queryKey: ['superadmin', 'users', 'infinite', queryParams],
    queryFn: ({ pageParam = 1 }) =>
      fetchUsers({ ...queryParams, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    ...options,
  });
}

export function useFetchUser(userId, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', userId],
    queryFn: () => fetchuser(userId),
    enabled: Boolean(userId),
    ...options,
  });
}

export function useUserStatistics(queryParams = {}, options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'users', 'statistics', queryParams],
    queryFn: () => fetchUserStatistics(queryParams),
    keepPreviousData: true,
    ...options,
  });
}

export function useUpdateUser(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ userId, payload }) => updateUser(userId, payload),
    onSuccess: async (response, variables, context) => {
      const userId =
        variables?.userId ??
        variables?.id ??
        response?.data?.userId ??
        response?.data?.data?.userId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'users'],
      });

      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'users', userId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useDeleteUser(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ userId }) => deleteUser(userId),
    onSuccess: async (response, variables, context) => {
      const { userId } = variables;

      // Invalidate the list query to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'users'],
      });

      // Also remove the individual company query if it exists
      if (userId) {
        queryClient.removeQueries({
          queryKey: ['superadmin', 'users', userId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useCreateUser(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => addUser(payload),
    onSuccess: async (response, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'users'],
      });

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useAssignApprover(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ userId, approverId }) =>
      assignApproverToOperator(userId, approverId),
    onSuccess: async (response, variables, context) => {
      const userId =
        variables?.userId ??
        variables?.id ??
        response?.data?.userId ??
        response?.data?.data?.userId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'users'],
      });

      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'users', userId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}

export function useUnAssignApprover(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: ({ userId, approverId }) =>
      unassignApproverToOperator(userId, approverId),
    onSuccess: async (response, variables, context) => {
      const userId =
        variables?.userId ??
        variables?.id ??
        response?.data?.userId ??
        response?.data?.data?.userId;

      await queryClient.invalidateQueries({
        queryKey: ['superadmin', 'users'],
      });

      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ['superadmin', 'users', userId],
        });
      }

      if (onSuccess) {
        await onSuccess(response, variables, context);
      }
    },
    ...mutationOptions,
  });
}
