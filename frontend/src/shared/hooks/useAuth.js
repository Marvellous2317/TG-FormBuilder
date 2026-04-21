import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useToast from './useToast';
import {
  changePassword,
  forgotPassword,
  getUserAnalytics,
  login,
  resetPassword,
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

const getErrorMessage = (error, message) => {
  if (typeof error === 'object' && error !== null) {
    const responseMessage =
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data
        ? error.response.data.message
        : null;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return message;
};

export default function useAuth() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
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
    onError: (error) => {
      showError(getErrorMessage(error, 'Unable to login. Please try again.'));
    },
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
      showError(
        getErrorMessage(error, 'Unable to change password. Please try again.'),
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess(successMessage);
      navigate('/forgot-password', { replace: true });
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Unable to reset password. Please try again.'),
      );
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess(successMessage);
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Unable to reset password. Please try again.'),
      );
    },
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
    forgotPassword: resetPasswordMutation.mutateAsync,
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
