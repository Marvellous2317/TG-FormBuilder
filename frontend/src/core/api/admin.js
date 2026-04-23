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
    `/checklists/admin/${checklistId}`,
    payload,
  );
  return data;
};

export const fetchChecklistsEntries = async (id) => {
  const { data } = await axiosInstance.get(`/checklists/admin/${id}/entries`);
  return data;
};

export const createChecklistEntries = async (id, payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/admin/${id}/entries`,
    payload,
  );
  return data;
};

export const updateChecklistEntries = async (id, payload) => {
  const { data } = await axiosInstance.put(
    `/checklists/admin/${id}/entries`,
    payload,
  );
  return data;
};

export const fetchChecklistCatalogs = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/checklists/admin/get-all-catalogs',
    {
      params,
    },
  );
  return data;
};

export const fetchChecklistCatalog = async (id) => {
  const { data } = await axiosInstance.get(`/checklists/admin/catalogs/${id}`);
  return data;
};

export const deleteChecklistCatalog = async (id) => {
  const { data } = await axiosInstance.delete(
    `/checklists/admin/catalogs/${id}`,
  );
  return data;
};

export const createChecklistCatalog = async (payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/admin/catalogs`,
    payload,
  );
  return data;
};

export const updateChecklistCatalog = async (payload, catalogId) => {
  console.log(payload, catalogId);
  const { data } = await axiosInstance.put(
    `/checklists/admin/catalogs/${catalogId}`,
    payload,
  );
  return data;
};

export const assignChecklistOperator = async (payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/admin/assignments`,
    payload,
  );
  return data;
};

export const unAssignChecklistOperator = async (payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/admin/unassignments`,
    payload,
  );
  return data;
};
