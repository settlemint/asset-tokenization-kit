'use client';

import { AssetForm } from '@/components/blocks/asset-form/asset-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAddContactFormSchema } from './schema';
import { Contact } from './steps/contact';
import { addContact } from './store';

export function AddContactForm({
  onCloseAction,
}: {
  onCloseAction: () => void;
}) {
  return (
    <AssetForm
      cacheInvalidationConfig={{
        clientCacheKey: ['contacts'],
        serverCachePath: () => '/admin/contacts',
      }}
      storeAction={addContact}
      resolverAction={zodResolver(getAddContactFormSchema())}
      onClose={onCloseAction}
      submitLabel="Transfer"
      messages={{
        onCreate: (input) => `Adding contact ${input.firstName} ${input.lastName}`,
        onSuccess: (input) => `Contact ${input.firstName} ${input.lastName} added successfully`,
        onError: (input, error) => `Failed to add contact ${input.firstName} ${input.lastName}: ${error.message}`,
      }}
    >
      <Contact />
    </AssetForm>
  );
}
