import axiosInstance from '../../shared/utils/axios';

export const login = async (payload) => {
  const { data } = await axiosInstance.post('/auth/signin', payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post('/auth/change-password', payload);
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await axiosInstance.post('/auth/reset-password', payload);
  return data;
};

export const forgotPassword = async (payload) => {
  const { data } = await axiosInstance.post(
    `/auth/forgot-password/${payload.email}`,
    {
      otp: payload.otp,
      password: payload.password,
    },
  );
  return data;
};
