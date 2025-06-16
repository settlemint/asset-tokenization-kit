import { forbidden, unauthorized } from "next/navigation";
import { AccessControlError } from "../utils/access-control";

export function handleAccessControlError(error: AccessControlError): never {
  if (error.statusCode === 403) {
    forbidden();
  }
  if (error.statusCode === 401) {
    unauthorized();
  }

  throw error;
}
