import type { APIRequestContext } from '@playwright/test';

export async function ensureApiPincodeIsSetup(
  requestContext: APIRequestContext,
  userEmail: string,
  pincodeToSet: string,
  userPasswordForFallback: string
): Promise<void> {
  const pincodePayloadOnly = { pincode: pincodeToSet };
  let pincodeEnableResponse = await requestContext.post(
    '/api/auth/pincode/enable',
    {
      data: pincodePayloadOnly,
    }
  );

  let attemptWithPasswordNeeded = false;

  if (!pincodeEnableResponse.ok()) {
    const errorBodyText = await pincodeEnableResponse.text();
    let errorBodyJson;
    try {
      errorBodyJson = JSON.parse(errorBodyText);
    } catch (_parseError) {}

    const isPincodeAlreadySet =
      pincodeEnableResponse.status() === 400 &&
      errorBodyJson?.message?.includes('Pincode already set');
    const isPasswordRequired =
      pincodeEnableResponse.status() === 400 &&
      errorBodyJson?.message?.includes('Password is required');

    if (isPasswordRequired) {
      attemptWithPasswordNeeded = true;
    } else if (!isPincodeAlreadySet) {
      attemptWithPasswordNeeded = true;
    }
  }

  if (attemptWithPasswordNeeded) {
    const pincodePayloadWithPassword = {
      pincode: pincodeToSet,
      password: userPasswordForFallback,
    };
    pincodeEnableResponse = await requestContext.post(
      '/api/auth/pincode/enable',
      {
        data: pincodePayloadWithPassword,
      }
    );

    if (!pincodeEnableResponse.ok()) {
      const finalErrorBodyText = await pincodeEnableResponse.text();
      let finalErrorBodyJson;
      try {
        finalErrorBodyJson = JSON.parse(finalErrorBodyText);
      } catch (_parseError) {}

      const isStillPincodeAlreadySet =
        pincodeEnableResponse.status() === 400 &&
        finalErrorBodyJson?.message?.includes('Pincode already set');

      if (!isStillPincodeAlreadySet) {
        throw new Error(
          `[SETUP UTILS] Pincode setup failed after all attempts for ${userEmail}.`
        );
      }
    }
  }
}
