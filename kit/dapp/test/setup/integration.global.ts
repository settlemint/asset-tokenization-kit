import { execSync } from "node:child_process";
import { authClient } from "../fixtures/auth-client";
import { getDappUrl } from "../fixtures/dapp";
import { getOrpcClient } from "../fixtures/orpc-client";
import {
  bootstrapSystem,
  bootstrapTokenFactories,
  setupDefaultIssuerRoles,
} from "../fixtures/system-bootstrap";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  setupUser,
  signInWithUser,
} from "../fixtures/user";

export async function setup() {
  try {
    // Wait for containerized dapp to be ready
    await waitForDapp();

    // Create admin first to avoid race on first-user admin role
    await setupUser(DEFAULT_ADMIN);

    // Verify admin session/role and wallet after signup
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    const adminSession = await authClient.getSession({
      fetchOptions: {
        headers: {
          ...Object.fromEntries(adminHeaders.entries()),
        },
      },
    });
    const adminInfo = {
      email: DEFAULT_ADMIN.email,
      role: adminSession.data?.user.role,
      wallet: adminSession.data?.user.wallet,
      pincodeEnabled: adminSession.data?.user.pincodeEnabled,
      secretCodesConfirmed: adminSession.data?.user.secretCodesConfirmed,
    };
    if (adminInfo.role !== "admin") {
      console.warn(
        "[setup] WARNING: Admin user does not have admin role. This can cause FORBIDDEN errors during system bootstrap."
      );
    }

    // Create remaining users in parallel
    await Promise.all([setupUser(DEFAULT_INVESTOR), setupUser(DEFAULT_ISSUER)]);

    const orpClient = getOrpcClient(adminHeaders);
    const system = await bootstrapSystem(orpClient);

    // Parallelize post-boot operations
    await Promise.all([
      bootstrapTokenFactories(orpClient, system),
      setupDefaultIssuerRoles(orpClient),
    ]);
  } catch (error: unknown) {
    console.error("Failed to setup test environment", error);
    try {
      // Best-effort extra debug info on failure
      const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
      const session = await authClient.getSession({
        fetchOptions: {
          headers: { ...Object.fromEntries(adminHeaders.entries()) },
        },
      });
      console.error("[debug] Admin session on failure:", {
        email: DEFAULT_ADMIN.email,
        role: session.data?.user.role,
        wallet: session.data?.user.wallet,
        pincodeEnabled: session.data?.user.pincodeEnabled,
        secretCodesConfirmed: session.data?.user.secretCodesConfirmed,
      });
    } catch (e) {
      console.error("[debug] Failed to fetch admin session for debugging:", e);
    }
    process.exit(1);
  }
}

export const teardown = () => {
  // Nothing to teardown as containers are managed by docker-compose
};

async function waitForDapp() {
  console.log("Waiting for containerized dapp to be ready...");
  const maxAttempts = 600; // 60 seconds timeout
  const delayMs = 100;

  // Try to detect the actual container name
  let containerName = "atk-test-dapp"; // Default for test environment
  try {
    const containerList = execSync(
      "docker ps --format '{{.Names}}' | grep -E '(atk|dapp)' | grep dapp | head -1",
      { encoding: "utf-8" }
    ).trim();
    if (containerList) {
      containerName = containerList;
      console.log(`Found dapp container: ${containerName}`);
    }
  } catch {
    // Use default if detection fails
    console.log(`Using default container name: ${containerName}`);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(getDappUrl());
      if (response.ok) {
        console.log("Containerized dapp is ready!");
        return;
      }
    } catch {
      // Ignore connection errors
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Dump container logs before failing
  console.error("\n=== Container failed to become ready. Dumping logs ===");
  try {
    const logs = execSync(`docker logs ${containerName} --tail 100`, {
      encoding: "utf-8",
    });
    console.error("Container logs (last 100 lines):");
    console.error(logs);
  } catch (logError) {
    console.error(`Failed to retrieve container logs: ${logError}`);
  }

  // Also check container status
  try {
    const status = execSync(
      `docker inspect ${containerName} --format='{{json .State}}'`,
      { encoding: "utf-8" }
    );
    console.error("\nContainer status:");
    console.error(JSON.parse(status));
  } catch (statusError) {
    console.error(`Failed to inspect container: ${statusError}`);
  }

  throw new Error("Containerized dapp did not become ready in time");
}
