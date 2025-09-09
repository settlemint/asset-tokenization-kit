import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { baseRouter } from "@/orpc/procedures/base.router";
import z from "zod";

/**
 * GraphQL query to fetch trusted issuer topics for the authenticated user.
 *
 * This query determines what claim topics the current user is authorized to issue
 * claims for as a trusted issuer. This is different from userClaimsMiddleware which
 * fetches claims that have been issued TO the user.
 */
const READ_USER_TRUSTED_ISSUER_TOPICS_QUERY = theGraphGraphql(`
  query GetUserTrustedIssuerTopics($userWallet: Bytes!) {
    trustedIssuers(where: { account_: { id: $userWallet } }) {
      claimTopics {
        name
      }
    }
  }
`);

/**
 * Response schema for the trusted issuer topics query
 */
const TrustedIssuerTopicsResponseSchema = z.object({
  trustedIssuers: z.array(
    z.object({
      claimTopics: z.array(
        z.object({
          name: z.string(),
        })
      ),
    })
  ),
});

/**
 * Middleware to inject the user's trusted issuer topics into the request context.
 *
 * This middleware fetches the claim topics that the authenticated user is authorized
 * to issue claims for as a trusted issuer. This is used for authorization in identity
 * management workflows where users should only see claims for topics they can verify.
 *
 * **Key Difference from userClaimsMiddleware:**
 * - userClaimsMiddleware: Gets claims the user HAS on their identity (verification status)
 * - trustedIssuerMiddleware: Gets topics the user can ISSUE claims for (authorization scope)
 *
 * **Use Cases:**
 * - Identity managers viewing all user claims
 * - KYC officers viewing only KYC-related claims
 * - AML officers viewing only AML-related claims
 * - Filtering user data based on issuer authorization
 *
 * **Context Extension:**
 * Adds `userTrustedIssuerTopics: string[]` to context containing topic names
 * the user is authorized to issue claims for. Empty array if user is not a trusted issuer.
 *
 * **Middleware Dependencies:**
 * - Requires theGraphMiddleware to be called first
 * - Works with or without authentication (graceful fallback)
 *
 * @returns The middleware function that extends context with trusted issuer topics
 *
 * @example
 * ```typescript
 * // User who is a trusted issuer for KYC
 * const route = baseRouter
 *   .use(theGraphMiddleware)
 *   .use(trustedIssuerMiddleware)
 *   .handler(({ context }) => {
 *     console.log(context.userTrustedIssuerTopics); // ["kyc"]
 *   });
 *
 * // User who is not a trusted issuer
 * const route = baseRouter
 *   .use(theGraphMiddleware)
 *   .use(trustedIssuerMiddleware)
 *   .handler(({ context }) => {
 *     console.log(context.userTrustedIssuerTopics); // []
 *   });
 * ```
 */
export const trustedIssuerMiddleware = baseRouter.middleware<
  Required<Pick<Context, "userTrustedIssuerTopics">>,
  unknown
>(async ({ next, context, errors }) => {
  // If user is not authenticated, provide empty array (graceful fallback)
  if (!context.auth) {
    return await next({
      context: {
        userTrustedIssuerTopics: [],
      },
    });
  }

  const { theGraphClient } = context;

  // Ensure theGraphClient is available
  if (!theGraphClient) {
    throw errors.INTERNAL_SERVER_ERROR({
      message:
        "theGraphMiddleware should be called before trustedIssuerMiddleware",
    });
  }

  try {
    // Query TheGraph for user's trusted issuer topics
    const { trustedIssuers } = await theGraphClient.query(
      READ_USER_TRUSTED_ISSUER_TOPICS_QUERY,
      {
        input: { userWallet: context.auth.user.wallet },
        output: TrustedIssuerTopicsResponseSchema,
      }
    );

    // Extract topic names from the response
    // Note: A user can be registered as a trusted issuer in multiple registries,
    // but we flatten all topics they can issue across all registries
    const userTrustedIssuerTopics: string[] = trustedIssuers.flatMap((issuer) =>
      issuer.claimTopics.map((topic) => topic.name)
    );

    return await next({
      context: {
        userTrustedIssuerTopics,
      },
    });
  } catch {
    // If the query fails, provide empty array as fallback
    // This prevents the entire request from failing if TheGraph is unavailable
    // TODO: Add proper logging middleware for production error tracking

    return await next({
      context: {
        userTrustedIssuerTopics: [],
      },
    });
  }
});
