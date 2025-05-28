import {
  request as apiRequest,
  type APIRequestContext,
  type FullConfig,
} from "@playwright/test";
import { adminApiUser } from "./test-data/user-data";

const TEST_SETUP_USER_EMAIL = adminApiUser.email;
const TEST_SETUP_USER_PASSWORD = adminApiUser.password;

async function globalTeardown(config: FullConfig) {
  const apiKeyIdToDelete: string | undefined = process.env.API_KEY_ID_TO_DELETE;

  if (apiKeyIdToDelete) {
    const configuredBaseURL =
      process.env.API_BASE_URL ??
      config.projects[0]?.use?.baseURL ??
      "http://localhost:3000";
    let requestContext: APIRequestContext | undefined;
    let loginOk = false;

    try {
      requestContext = await apiRequest.newContext({
        baseURL: configuredBaseURL,
      });

      const loginResponse = await requestContext.post(
        "/api/auth/sign-in/email",
        {
          data: {
            email: TEST_SETUP_USER_EMAIL,
            password: TEST_SETUP_USER_PASSWORD,
            rememberMe: false,
          },
        }
      );

      if (!loginResponse.ok()) {
        console.error(
          `[GLOBAL TEARDOWN] Login failed for ${TEST_SETUP_USER_EMAIL} (Status: ${loginResponse.status()}). Cannot delete API key ID: ${apiKeyIdToDelete}.`
        );
      } else {
        loginOk = true;
      }

      if (loginOk) {
        const deleteResponse = await requestContext.post(
          "/api/auth/api-key/delete",
          {
            data: { keyId: apiKeyIdToDelete },
          }
        );
        if (!deleteResponse.ok()) {
          const errorBody = await deleteResponse.text();
          console.error(
            `[GLOBAL TEARDOWN] Failed to delete API key ID: ${apiKeyIdToDelete}. Status: ${deleteResponse.status()}, Body: ${errorBody}`
          );
        }
      }
    } catch (error) {
      console.error(
        `[GLOBAL TEARDOWN] Error during API key deletion process for ID ${apiKeyIdToDelete}: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      if (requestContext) await requestContext.dispose();
    }
  }
}

export default globalTeardown;
