import { beforeAll } from "bun:test";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  authClient,
} from "../utils/auth-client";

beforeAll(async () => {
  await authClient.signUp.email(DEFAULT_ADMIN);
  await authClient.signUp.email(DEFAULT_INVESTOR);
  await authClient.signUp.email(DEFAULT_ISSUER);
});
