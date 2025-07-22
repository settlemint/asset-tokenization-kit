import {
  request as apiRequest,
  type APIRequestContext,
  type FullConfig,
} from "@playwright/test";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { adminApiUser } from "./test-data/user-data";
import { ensureUserIsAdmin, isPincodeEnabledInDB } from "./utils/db-utils";
import { ensureApiPincodeIsSetup } from "./utils/setup-utils";

const _e2eDir = path.dirname(fileURLToPath(import.meta.url));

const API_KEY_NAME_TO_ENSURE = "test-apikey";

const TEST_SETUP_USER_EMAIL = adminApiUser.email;
const TEST_SETUP_USER_PASSWORD = adminApiUser.password;
const TEST_SETUP_USER_NAME = adminApiUser.name;
const TEST_SETUP_USER_PINCODE = adminApiUser.pincode;

async function globalSetup(config: FullConfig) {
  const configuredBaseURL =
    config.projects.find((p) => p.name === "api-tests")?.use?.baseURL ??
    config.projects[0]?.use?.baseURL ??
    "http://localhost:3000";
  process.env.API_BASE_URL = process.env.API_BASE_URL || configuredBaseURL;

  let requestContext: APIRequestContext | undefined;

  try {
    requestContext = await apiRequest.newContext({
      baseURL: process.env.API_BASE_URL,
    });

    let loginResponse = await requestContext.post("/api/auth/sign-in/email", {
      data: {
        email: TEST_SETUP_USER_EMAIL,
        password: TEST_SETUP_USER_PASSWORD,
        rememberMe: false,
      },
    });

    let userJustCreated = false;
    if (!loginResponse.ok()) {
      const signUpResponse = await requestContext.post(
        "/api/auth/sign-up/email",
        {
          data: {
            email: TEST_SETUP_USER_EMAIL,
            password: TEST_SETUP_USER_PASSWORD,
            name: TEST_SETUP_USER_NAME,
          },
        }
      );
      if (!signUpResponse.ok()) {
        const errorBody = await signUpResponse.text();

        throw new Error(
          `User sign-up failed for ${TEST_SETUP_USER_EMAIL}. Status: ${signUpResponse.status()}, Body: ${errorBody}`
        );
      }
      userJustCreated = true;
    }

    if (userJustCreated || !loginResponse.ok()) {
      loginResponse = await requestContext.post("/api/auth/sign-in/email", {
        data: {
          email: TEST_SETUP_USER_EMAIL,
          password: TEST_SETUP_USER_PASSWORD,
          rememberMe: false,
        },
      });
      if (!loginResponse.ok()) {
        throw new Error(
          `Definitive login for ${TEST_SETUP_USER_EMAIL} failed (Status: ${loginResponse.status()})`
        );
      }
    }

    await ensureUserIsAdmin(TEST_SETUP_USER_EMAIL);

    const pincodeAlreadyEnabledInDB = await isPincodeEnabledInDB(
      TEST_SETUP_USER_EMAIL
    );
    if (!pincodeAlreadyEnabledInDB) {
      await ensureApiPincodeIsSetup(
        requestContext,
        TEST_SETUP_USER_EMAIL,
        TEST_SETUP_USER_PINCODE,
        TEST_SETUP_USER_PASSWORD
      );
    }
    const createKeyResponse = await requestContext.post(
      "/api/auth/api-key/create",
      {
        data: { name: API_KEY_NAME_TO_ENSURE },
      }
    );

    const responseBodyText = await createKeyResponse.text();

    if (!(createKeyResponse.ok() || createKeyResponse.status() === 409)) {
      throw new Error(
        `Failed to create/ensure API key. Status: ${createKeyResponse.status()}, Body: ${responseBodyText}`
      );
    }

    let responseBody;
    try {
      responseBody = JSON.parse(responseBodyText);
    } catch (e) {
      throw new Error(
        `Failed to parse API key creation response as JSON: ${(e as Error).message}. Response text: ${responseBodyText}`
      );
    }

    if (responseBody && responseBody.id) {
      process.env.API_KEY_ID_TO_DELETE = responseBody.id;
    } else {
      if (createKeyResponse.status() !== 409) {
        throw new Error(
          "API key creation response did not contain an 'id' and was not a 409 conflict."
        );
      }
    }

    const apiKeyActualValue =
      responseBody?.keyToken ??
      responseBody?.key ??
      responseBody?.token ??
      responseBody?.apiKey;

    if (apiKeyActualValue) {
      process.env.AUTH_API_KEY_FROM_SETUP = apiKeyActualValue;
    } else {
      if (createKeyResponse.status() !== 409) {
        throw new Error(
          "API key creation response did not contain the API key value and was not a 409 conflict."
        );
      }
    }
  } catch (error) {
    console.error(
      `[GLOBAL SETUP] CRITICAL ERROR DURING SETUP: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) console.error(error.stack);
    throw error;
  } finally {
    if (requestContext) await requestContext.dispose();
  }
}

export default globalSetup;
