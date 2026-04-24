import axiosInstance from '../../shared/utils/axios';

export const getApproverSubmittedChecklists = async (params = {}) => {
  const { data } = await axiosInstance.get('/checklists/approval', {
    params,
  });
  return data;
};

export const getApproverSubmittedChecklist = async (id) => {
  const { data } = await axiosInstance.get(`/checklists/approval/${id}`);
  return data;
};

export const approveChecklistEntry = async (id, payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/approval/${id}/approve`,
    payload,
  );
  return data;
};

export const rejectChecklistEntry = async (id, payload) => {
  const { data } = await axiosInstance.post(
    `/checklists/approval/${id}/reject`,
    payload,
  );
  return data;
};

export const uploadSignature = async (payload) => {
  const { data } = await axiosInstance.post(`/user/upload-signature`, payload);
  return data;
};
