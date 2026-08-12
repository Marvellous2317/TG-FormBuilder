import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useToast from './useToast';
import {
  changePassword,
  forgotPassword,
  getUserAnalytics,
  getUserProfile,
  login,
  resetPassword,
  userProfileUpdate,
} from '../../core/api/auth';

const getRoleHomePath = (user) => {
  const roleName = user?.role?.roleName?.toLowerCase();

  switch (roleName) {
    case 'superadmin':
      return '/superadmin';
    case 'admin':
      return '/admin';
    case 'operator':
      return '/operator';
    case 'approver':
      return '/approver';
    default:
      return '/';
  }
};

// const getErrorMessage = (error, message) => {
//   if (typeof error === 'object' && error !== null) {
//     const responseMessage =
//       'response' in error &&
//       typeof error.response === 'object' &&
//       error.response !== null &&
//       'data' in error.response &&
//       typeof error.response.data === 'object' &&
//       error.response.data !== null &&
//       'message' in error.response.data
//         ? error.response.data.message
//         : null;

//     if (typeof responseMessage === 'string' && responseMessage.trim()) {
//       return responseMessage;
//     }

//     if ('message' in error && typeof error.message === 'string') {
//       return error.message;
//     }
//   }

//   return message;
// };

export default function useAuth() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      useAuthStore.getState().clearAuth();
      useAuthStore.getState().setAuthFromLogin(response);

      const user = response?.data?.user;
      const successMessage =
        response?.data?.message || response?.message || 'Login successful';

      showSuccess(successMessage);

      if (response?.data?.requiresPasswordChange) {
        navigate('/change-password', { replace: true });
        return;
      }

      navigate(getRoleHomePath(user), { replace: true });
    },
    onError: () => {},
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess(successMessage);
      useAuthStore.getState().clearAuth();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
  showError(error?.response?.data?.message || 'Failed to change password');
},
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess(successMessage);
      navigate('/reset-password', { replace: true });
    },
    onError: () => {},
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess(successMessage);
      navigate('/login', { replace: true });
    },
    onError: () => {},
  });

  return {
    login: loginMutation.mutateAsync,
    loginMutation,
    isLoggingIn: loginMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    changePasswordMutation,
    isChangingPassword: changePasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    resetPasswordMutation,
    isResetingPassword: resetPasswordMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    forgotPasswordMutation,
    isForgettingPassword: forgotPasswordMutation.isPending,
  };
}

export function useUserAnalytics(userId, options = {}) {
  return useQuery({
    queryKey: ['user', 'analytics', userId],
    queryFn: () => getUserAnalytics(),
    keepPreviousData: true,
    ...options,
  });
}

export function useProfile(options = {}) {
  const { setUser } = useAuthStore();
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => getUserProfile(),
    keepPreviousData: true,
    ...options,
    onSuccess: (data) => {
      const profileData = data?.data?.user ?? data?.data;
      if (profileData) {
        const current = useAuthStore.getState().user;
        setUser({ ...current, ...profileData });
      }
      options.onSuccess?.(data);
    },
  });
}

export function useProfileUpdate(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options;

  return useMutation({
    mutationFn: (payload) => userProfileUpdate(payload),
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
