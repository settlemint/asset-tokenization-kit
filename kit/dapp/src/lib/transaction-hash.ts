export function getTransactionHashFromEventId(eventId: string): string {
  return eventId.slice(0, -8);
}
