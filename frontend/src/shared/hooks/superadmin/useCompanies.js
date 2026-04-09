import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCompanies,
  fetchCompany,
  updateCompany,
} from '../../../core/api/superadmin';

export function useCompanies(options = {}) {
  return useQuery({
    queryKey: ['superadmin', 'companies'],
    queryFn: fetchCompanies,
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
    mutationFn: updateCompany,
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
