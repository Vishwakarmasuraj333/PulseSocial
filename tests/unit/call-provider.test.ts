import assert from "assert";
import { LiveKitCallProvider, getCallProvider, CallProvider } from "../../src/lib/calls/call-provider";

export async function runCallProviderTests() {
  console.log("\n--- [UNIT TEST: CALL PROVIDER (LIVEKIT) ADAPTER] ---");

  const provider = new LiveKitCallProvider();
  assert.strictEqual(provider.name, "livekit");

  // 1. Without credentials, must return configured: false and message: "Calls not configured..."
  const originalUrl = process.env.LIVEKIT_URL;
  const originalKey = process.env.LIVEKIT_API_KEY;
  const originalSecret = process.env.LIVEKIT_API_SECRET;

  try {
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;

    assert.strictEqual(provider.isConfigured(), false);
    const result = await provider.createSession({
      roomName: "team-meeting-1",
      participantIdentity: "user-123",
      participantName: "Test User",
    });

    assert.strictEqual(result.configured, false);
    assert.strictEqual(result.status, "not_configured");
    assert.ok(result.message.includes("Calls not configured"), "Must report 'Calls not configured'");
    console.log("  ✔ Verified: Unconfigured LiveKit returns honest status='not_configured' and 'Calls not configured'.");

    // 2. With mock credentials, reports configured: true
    process.env.LIVEKIT_URL = "wss://livekit.pulsesocial.io";
    process.env.LIVEKIT_API_KEY = "test_api_key_livekit";
    process.env.LIVEKIT_API_SECRET = "test_api_secret_livekit_32char_key";

    assert.strictEqual(provider.isConfigured(), true);
    const configuredResult = await provider.createSession({
      roomName: "team-meeting-1",
      participantIdentity: "user-123",
      participantName: "Test User",
    });

    assert.strictEqual(configuredResult.configured, true);
    assert.strictEqual(configuredResult.status, "configured");
    console.log("  ✔ Verified: Configured LiveKit initializes session parameters successfully.");
  } finally {
    process.env.LIVEKIT_URL = originalUrl;
    process.env.LIVEKIT_API_KEY = originalKey;
    process.env.LIVEKIT_API_SECRET = originalSecret;
  }
}

if (require.main === module) {
  runCallProviderTests()
    .then(() => console.log("✔ Call provider tests passed."))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
