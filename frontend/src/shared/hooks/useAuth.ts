import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { changePassword, login } from '../utils/endpoints';
import { useAuthStore } from '../store/authStore';
import useToast from './useToast';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  type LoginPayload,
  type LoginResponse,
  type User,
} from '../utils/types';

const getRoleHomePath = (user: User | null | undefined) => {
  const roleName = user?.role?.roleName?.toLowerCase();

  switch (roleName) {
    case 'superadmin':
      return '/superadmin/roles';
    case 'admin':
      return '/admin/dashboard';
    case 'operator':
      return '/operator/workspace';
    case 'approver':
      return '/approver';
    default:
      return '/';
  }
};

const getErrorMessage = (error: unknown, message: string) => {
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

  const loginMutation = useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: login,
    onSuccess: (response) => {
      useAuthStore.getState().setAuthFromLogin(response);

      const user = response?.data?.user;
      const successMessage =
        response?.data?.message || response?.message || 'Login successful';

      showSuccess('Login successful', successMessage);

      if (response?.data?.requiresPasswordChange) {
        navigate('/change-password', { replace: true });
        return;
      }

      navigate(getRoleHomePath(user), { replace: true });
    },
    onError: (error) => {
      showError(
        'Login failed',
        getErrorMessage(error, 'Unable to login. Please try again.'),
      );
    },
  });

  const changePasswordMutation = useMutation<
    ChangePasswordResponse,
    unknown,
    ChangePasswordPayload
  >({
    mutationFn: changePassword,
    onSuccess: (response) => {
      const successMessage =
        response?.data?.message || response?.message || 'Password changed';
      showSuccess('Change password successful', successMessage);
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      showError(
        'Change password failed',
        getErrorMessage(error, 'Unable to change password. Please try again.'),
      );
    },
  });

  return {
    login: loginMutation.mutateAsync,
    loginMutation,
    isLoggingIn: loginMutation.isPending,
  };
}
