import axiosInstance from '../shared/utils/axios';
import { getPendingSubmissions, removeSubmission } from './offlineQueue';
import { useToastStore } from '../shared/store/toastStore';

export async function syncPendingSubmissions() {
  const pending = await getPendingSubmissions();
  if (pending.length === 0) return;

  const { showSuccess, showError, showWarning } = useToastStore.getState();

  let synced = 0;
  let discarded = 0;
  let stillPending = 0;

  for (const item of pending) {
    const { checklistId, payload } = item.data;

    if (!checklistId || !payload) {
      // Malformed queue item — discard it
      await removeSubmission(item.id);
      discarded += 1;
      continue;
    }

    try {
      await axiosInstance.post(
        `/checklists/operator/${checklistId}/submit`,
        payload,
        { skipGlobalErrorToast: true },
      );
      await removeSubmission(item.id);
      synced += 1;
    } catch (err) {
      const status = err.response?.status;
      const isAuthError = status === 401 || status === 403;
      if (status >= 400 && status < 500 && !isAuthError) {
        // 4xx (excluding auth errors) means bad data — won't succeed on retry, discard
        await removeSubmission(item.id);
        discarded += 1;
      } else {
        // Network error, 401/403 (session expired — retry after re-auth), or 5xx — leave in queue, try again next time
        stillPending += 1;
      }
    }
  }

  if (synced > 0) {
    showSuccess(
      `${synced} offline ${synced === 1 ? 'entry' : 'entries'} synced successfully`,
    );
  }

  if (discarded > 0) {
    showError(
      `${discarded} offline ${discarded === 1 ? 'entry' : 'entries'} failed to sync and ${discarded === 1 ? 'was' : 'were'} discarded`,
    );
  }

  if (stillPending > 0) {
    showWarning(
      `${stillPending} offline ${stillPending === 1 ? 'entry is' : 'entries are'} still pending — will retry later`,
    );
  }
}
