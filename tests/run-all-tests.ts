import { runOtpAndAuthUnitTests } from "./unit/otp-and-auth.test";
import { runTokenVaultUnitTests } from "./unit/token-vault.test";
import { runCapabilitiesUnitTests } from "./unit/capabilities-and-truth.test";
import { runCronAndSecurityUnitTests } from "./unit/cron-and-security.test";
import { runTenantIsolationTests } from "./integration/tenant-isolation.test";
import { runAuthEndToEndTests } from "./integration/auth-e2e.test";
import { runPublishingContractTests } from "./integration/publishing-contract.test";
import { runConsentUnitTests } from "./unit/consent.test";
import { runRealtimeIntegrationTests } from "./integration/realtime.test";
import { runAuditScreenFixesTests } from "./integration/audit-screen-fixes.test";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("==================================================================");
  console.log("   PULSESOCIAL BACKEND MASTER VERIFICATION TEST SUITE (v2.0)");
  console.log("==================================================================");

  const startTime = Date.now();
  let passedSuites = 0;
  const totalSuites = 10;

  try {
    // Suite 1: OTP & Auth
    await runOtpAndAuthUnitTests();
    passedSuites++;

    // Suite 2: Token Vault (AES-256-GCM)
    await runTokenVaultUnitTests();
    passedSuites++;

    // Suite 3: Capabilities & Truthful Fallbacks
    await runCapabilitiesUnitTests();
    passedSuites++;

    // Suite 4: Cron Auth & Security Controls
    await runCronAndSecurityUnitTests();
    passedSuites++;

    // Suite 5: Multi-Tenant Workspace Isolation
    await runTenantIsolationTests();
    passedSuites++;

    // Suite 6: Auth End-to-End Flow
    await runAuthEndToEndTests();
    passedSuites++;

    // Suite 7: Publishing & Health Contracts
    await runPublishingContractTests();
    passedSuites++;

    // Suite 8: Cookie Consent Engine
    await runConsentUnitTests();
    passedSuites++;

    // Suite 9: Real-Time SSE & Consent Endpoints
    await runRealtimeIntegrationTests();
    passedSuites++;

    // Suite 10: Screen Audit Fixes & Truth Contract
    await runAuditScreenFixesTests();
    passedSuites++;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n==================================================================");
    console.log(`   ALL ${passedSuites}/${totalSuites} TEST SUITES PASSED IN ${duration}s! (100% SUCCESS)`);
    console.log("==================================================================");
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED WITH ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
