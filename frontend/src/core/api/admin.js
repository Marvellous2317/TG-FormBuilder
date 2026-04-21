import axiosInstance from '../../shared/utils/axios';

export const fetchChecklists = async (params = {}) => {
  const { data } = await axiosInstance.get('/checklists/admin', {
    params,
  });
  return data;
};

export const fetchChecklistsAnalytics = async () => {
  const { data } = await axiosInstance.get('/user/analytics');
  return data;
};

export const fetchChecklist = async (id) => {
  const { data } = await axiosInstance.get(`/checklists/admin/${id}`);
  return data;
};

export const deleteChecklist = async (id) => {
  const { data } = await axiosInstance.delete(`/checklists/admin/${id}`);
  return data;
};

export const createChecklist = async (payload) => {
  const { data } = await axiosInstance.post(`/checklists/admin`, payload);
  return data;
};

export const updateChecklist = async (payload, checklistId) => {
  const { data } = await axiosInstance.put(
    `/admin/checklists/${checklistId}`,
    payload,
  );
  return data;
};
