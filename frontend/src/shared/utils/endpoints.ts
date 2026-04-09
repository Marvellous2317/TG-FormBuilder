import axiosInstance from './axios';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
} from './types';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post('/auth/signin', payload);
  return data;
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  const { data } = await axiosInstance.post('/auth/change-password', payload);
  return data;
};
