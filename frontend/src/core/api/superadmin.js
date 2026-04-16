import axiosInstance from '../../shared/utils/axios';

export const fetchRoles = async () => {
  const { data } = await axiosInstance.get('/admin/roles');
  return data;
};

export const fetchRole = async (id) => {
  const { data } = await axiosInstance.get(`/admin/roles/${id}`);
  return data;
};

export const deleteRole = async (id) => {
  const { data } = await axiosInstance.delete(`/admin/roles/${id}`);
  return data;
};

export const createRole = async (payload) => {
  const { data } = await axiosInstance.post(`/admin/roles`, payload);
  return data;
};

export const updateRole = async (payload, roleId) => {
  const { data } = await axiosInstance.put(`/admin/roles/${roleId}`, payload);
  return data;
};

export const fetchCompanies = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/companies', {
    params,
  });
  return data;
};

export const fetchCompany = async (id) => {
  const { data } = await axiosInstance.get(`/admin/companies/${id}`);
  return data;
};

export const deleteCompany = async (id) => {
  const { data } = await axiosInstance.delete(`/admin/companies/${id}`);
  return data;
};

export const createCompany = async (payload) => {
  const { data } = await axiosInstance.post(`/admin/companies`, payload);
  return data;
};

export const updateCompany = async (payload) => {
  const { data } = await axiosInstance.put(`/admin/companies`, payload);
  return data;
};
