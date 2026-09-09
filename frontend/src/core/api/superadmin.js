import axiosInstance from '../../shared/utils/axios';

export const fetchRoles = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/roles', { params });
  return data;
};

export const fetchRole = async (id) => {
  const { data } = await axiosInstance.get(`/admin/roles/${id}`);
  return data;
};

export const restoreRole = async (id) => {
  const { data } = await axiosInstance.put(`/admin/roles/${id}/restore`);
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

export const updateCompany = async (companyId, payload) => {
  const { data } = await axiosInstance.put(
    `/admin/companies/${companyId}`,
    payload,
  );
  return data;
};

export const suspendCompany = async (companyId, payload) => {
  const { data } = await axiosInstance.put(
    `/admin/companies/${companyId}/suspend`,
    payload,
  );
  return data;
};

export const restoreCompany = async (companyId) => {
  const { data } = await axiosInstance.put(
    `/admin/companies/${companyId}/restore`,
  );
  return data;
};

export const activateCompany = async (companyId, payload) => {
  const { data } = await axiosInstance.put(
    `/admin/companies/${companyId}/activate`,
    payload,
  );
  return data;
};

export const fetchDashboardCompanyAnalytics = async () => {
  const { data } = await axiosInstance.get(`/admin/analytics`);
  return data;
};

export const fetchDashboardCompanyAdoptionAnalytics = async () => {
  const { data } = await axiosInstance.get(`/admin/analytics/adoption`);
  return data;
};

export const fetchCompanyAnalytics = async (id) => {
  const { data } = await axiosInstance.get(`/admin/analytics/${id}`);
  return data;
};

export const fetchDepartments = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/departments', {
    params,
  });
  return data;
};

export const fetchDepartment = async (id) => {
  const { data } = await axiosInstance.get(`/admin/departments/${id}`);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await axiosInstance.delete(`/admin/departments/${id}`);
  return data;
};

export const restoreDepartment = async (id) => {
  const { data } = await axiosInstance.put(`/admin/departments/${id}/restore`);
  return data;
};

export const createDepartment = async (payload) => {
  const { data } = await axiosInstance.post(`/admin/departments`, payload);
  return data;
};

export const updateDepartment = async (payload, departmentId) => {
  const { data } = await axiosInstance.put(
    `/admin/departments/${departmentId}`,
    payload,
  );
  return data;
};

export const fetchUserStatistics = async () => {
  const { data } = await axiosInstance.get(`/admin/user-statistics`);
  return data;
};

export const fetchUsers = async (params = {}) => {
  const { data } = await axiosInstance.get('/admin/users', {
    params,
  });
  return data;
};

export const fetchuser = async (id) => {
  const { data } = await axiosInstance.get(`/admin/users/${id}`);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/admin/users/${id}`);
  return data;
};

export const restoreUser = async (id) => {
  const { data } = await axiosInstance.put(`/admin/users/${id}/restore`);
  return data;
};

export const addUser = async (payload) => {
  const { data } = await axiosInstance.post(`/admin/add-user`, payload);
  return data;
};

export const updateUser = async (userId, payload) => {
  const { data } = await axiosInstance.put(`/admin/users/${userId}`, payload);
  return data;
};

export const assignApproverToOperator = async (userId, approverId) => {
  const { data } = await axiosInstance.put(
    `/admin/users/${userId}/assign-approver`,
    { approverId },
  );
  return data;
};

export const unassignApproverToOperator = async (userId, approverId) => {
  const { data } = await axiosInstance.put(
    `/admin/users/${userId}/unassign-approver`,
    { approverId },
  );
  return data;
};
