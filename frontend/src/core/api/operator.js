import axiosInstance from '../../shared/utils/axios';

export const getOperatorChecklists = async (params = {}) => {
  const { data } = await axiosInstance.get('/checklists/operator', {
    params,
  });
  return data;
};

export const getOperatorChecklist = async (id) => {
  const { data } = await axiosInstance.get(`/checklists/operator/${id}`);
  return data;
};

export const getOperatorSubmittedChecklists = async (params = {}) => {
  const { data } = await axiosInstance.get('/checklists/operator/submissions', {
    params,
  });
  return data;
};

export const getOperatorSubmittedChecklist = async (id) => {
  const { data } = await axiosInstance.get(
    `/checklists/operator/submissions/${id}`,
  );
  return data;
};

export const submitChecklistEntry = async (id, payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/operator/${id}/submit`,
    payload,
  );
  return data;
};

export const updateChecklistEntry = async (id, payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/operator/submissions/${id}`,
    payload,
  );
  return data;
};
