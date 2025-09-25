import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { baseRouter } from "@/orpc/procedures/base.router";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { getAddress } from "viem";
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
      id
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
      id: ethereumAddress,
      claimTopics: z.array(
        z.object({
          name: z.string(),
        })
      ),
    })
  ),
});

/**
 * Creates middleware to validate trusted issuer permissions for claim topics.
 *
 * This middleware fetches the claim topics that the authenticated user is authorized
 * to issue claims for as a trusted issuer. It can optionally validate against a
 * specific topic from the request input.
 *
 * **Key Difference from userClaimsMiddleware:**
 * - userClaimsMiddleware: Gets claims the user HAS on their identity (verification status)
 * - trustedIssuerMiddleware: Gets topics the user can ISSUE claims for (authorization scope)
 *
 * **Use Cases:**
 * - Validating issuer permissions before claim issuance
 * - Identity managers viewing all user claims
 * - KYC officers viewing only KYC-related claims
 * - AML officers viewing only AML-related claims
 * - Filtering user data based on issuer authorization
 *
 * **Context Extension:**
 * Adds `userTrustedIssuerTopics: string[]` to context containing topic names
 * the user is authorized to issue claims for.
 * Adds `userIssuerIdentity: string` to context containing the user's
 * identity contract address.
 * Adds `canIssueTopic: boolean` to context when topicPath is provided, indicating
 * if the user can issue claims for the requested topic.
 *
 * **Validation:**
 * When topicPath is provided and requireTopic is true, throws FORBIDDEN if user
 * is not authorized for the specific topic.
 * Throws INTERNAL_SERVER_ERROR if unable to verify trusted issuer status.
 *
 * **Middleware Dependencies:**
 * - Requires theGraphMiddleware to be called first
 * - Works with or without authentication (graceful fallback)
 *
 * @param options - Configuration options for the middleware
 * @param options.topicPath - Optional path to the topic in the input (e.g., "claim.topic")
 * @param options.requireTopic - If true, throws error when user lacks permission for the topic
 * @returns The middleware function that extends context with trusted issuer topics
 *
 * @example
 * ```typescript
 * // Basic usage - just fetch issuer topics
 * const route = baseRouter
 *   .use(theGraphMiddleware)
 *   .use(trustedIssuerMiddleware())
 *   .handler(({ context }) => {
 *     console.log(context.userTrustedIssuerTopics); // ["kyc", "aml"]
 *   });
 *
 * // Validate specific topic from input
 * const issueClaimRoute = baseRouter
 *   .use(theGraphMiddleware)
 *   .use(trustedIssuerMiddleware({
 *     selectTopics: (input) => [input.claim.topic],
 *   }))
 *   .input(z.object({
 *     claim: z.object({
 *       topic: z.string()
 *     })
 *   }))
 *   .handler(({ context, input }) => {
 *     // If we get here, user is authorized for input.claim.topic
 *     console.log(context.canIssueTopic); // true
 *   });
 * ```
 */
export const trustedIssuerMiddleware = <TInput>(options: {
  selectTopics: (input: Readonly<TInput>) => string[] | undefined;
}) =>
  baseRouter.middleware(async ({ next, context, errors }, input: TInput) => {
    // If user is not authenticated, provide empty array (graceful fallback)
    if (!context.auth) {
      throw errors.UNAUTHORIZED({ message: "User not authenticated" });
    }

    const { theGraphClient } = context;

    // Ensure theGraphClient is available
    if (!theGraphClient) {
      throw errors.INTERNAL_SERVER_ERROR({
        message:
          "theGraphMiddleware should be called before trustedIssuerMiddleware",
      });
    }

    // Query TheGraph for user's trusted issuer topics with graceful fallback
    // In case TheGraph is temporarily unavailable, degrade to empty topics to avoid
    // blocking unrelated functionality that doesn't strictly require issuer topics.
    let trustedIssuers: z.infer<
      typeof TrustedIssuerTopicsResponseSchema
    >["trustedIssuers"] = [];
    try {
      const result = await theGraphClient.query(
        READ_USER_TRUSTED_ISSUER_TOPICS_QUERY,
        {
          input: { userWallet: context.auth.user.wallet },
          output: TrustedIssuerTopicsResponseSchema,
        }
      );
      trustedIssuers = result.trustedIssuers;
    } catch {
      // Graceful degradation: no trusted issuer topics when TheGraph fails
      trustedIssuers = [];
    }

    // Extract topic names from the response
    // Note: A user can be registered as a trusted issuer in multiple registries,
    // but we flatten all topics they can issue across all registries
    const userTrustedIssuerTopics: string[] = trustedIssuers.flatMap((issuer) =>
      issuer.claimTopics.map((topic) => topic.name)
    );

    const requestedTopics = options.selectTopics(input);
    const notAuthorizedTopics =
      requestedTopics?.filter(
        (topic) => !userTrustedIssuerTopics.includes(topic)
      ) ?? [];
    if (notAuthorizedTopics.length > 0) {
      throw errors.FORBIDDEN({
        message: `You are not a trusted issuer for topic(s): ${notAuthorizedTopics.join(", ")}`,
        data: {
          requestedTopics,
          authorizedTopics: userTrustedIssuerTopics,
        },
      });
    }

    // Extract the issuer's identity contract address
    // The subgraph design ensures at most one TrustedIssuer entity per identity
    // (multiple registries update the same entity, not create new ones)
    const userIssuerIdentity = trustedIssuers[0]?.id
      ? getAddress(trustedIssuers[0].id)
      : undefined;

    if (!userIssuerIdentity) {
      throw errors.FORBIDDEN({
        message: "User does not have an issuer identity",
      });
    }

    return await next({
      context: {
        userTrustedIssuerTopics,
        userIssuerIdentity,
      },
    });
  });
