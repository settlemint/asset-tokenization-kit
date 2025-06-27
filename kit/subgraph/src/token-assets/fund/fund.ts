import type { ManagementFeeCollected } from '../../../generated/templates/Fund/Fund';
import { fetchEvent } from '../../event/fetch/event';

export function handleManagementFeeCollected(
  event: ManagementFeeCollected
): void {
  fetchEvent(event, 'ManagementFeeCollected');
}
