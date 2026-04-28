import axios from 'axios';
import { getPendingSubmissions, removeSubmission } from './offlineQueue';

export async function syncPendingSubmissions() {
  const pending = await getPendingSubmissions();
  if (pending.length === 0) return;

  console.log(`Syncing ${pending.length} pending submissions...`);

  for (const item of pending) {
    try {
      // TODO: CHANGE DOMAIN
      await axios.post(
        'https://tgpackagingappprd.azurewebsites.net/api/submissions',
        item.data,
      );
      await removeSubmission(item.id);
      console.log(`Synced submission ${item.id}`);
    } catch (err) {
      console.error(`Failed to sync submission ${item.id}`, err);
      break; // stop if still offline
    }
  }
}
