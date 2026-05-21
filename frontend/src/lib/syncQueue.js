import axiosInstance from '../shared/utils/axios';
import { getPendingSubmissions, removeSubmission } from './offlineQueue';

export async function syncPendingSubmissions() {
  const pending = await getPendingSubmissions();
  if (pending.length === 0) return;

  for (const item of pending) {
    const { checklistId, payload } = item.data;

    if (!checklistId || !payload) {
      // Malformed queue item — discard it
      await removeSubmission(item.id);
      continue;
    }

    try {
      await axiosInstance.post(`/checklists/operator/${checklistId}/submit`, payload);
      await removeSubmission(item.id);
    } catch (err) {
      const status = err.response?.status;
      if (status >= 400 && status < 500) {
        // 4xx means bad data — won't succeed on retry, discard
        await removeSubmission(item.id);
      }
      // Network error or 5xx — leave in queue, try again next time
    }
  }
}
