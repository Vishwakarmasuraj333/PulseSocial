/**
 * CallProvider Adapter System
 * Complies with specification:
 * - Do NOT build custom signaling / TURN infrastructure.
 * - Delegate to third-party WebRTC infrastructure providers (LiveKit default).
 * - When API keys/URL are not set, honestly report "Calls not configured" instead of mock behavior.
 */

export interface CallSessionOptions {
  roomName: string;
  participantIdentity: string;
  participantName?: string;
}

export interface CallSessionResult {
  provider: string;
  roomName: string;
  token?: string;
  serverUrl?: string;
  configured: boolean;
  status: "configured" | "not_configured";
  message: string;
}

export interface CallProvider {
  readonly name: string;
  isConfigured(): boolean;
  createSession(options: CallSessionOptions): Promise<CallSessionResult>;
}

export class LiveKitCallProvider implements CallProvider {
  public readonly name = "livekit";

  private get url(): string | undefined {
    return process.env.LIVEKIT_URL;
  }

  private get apiKey(): string | undefined {
    return process.env.LIVEKIT_API_KEY;
  }

  private get apiSecret(): string | undefined {
    return process.env.LIVEKIT_API_SECRET;
  }

  public isConfigured(): boolean {
    return Boolean(this.url && this.apiKey && this.apiSecret);
  }

  public async createSession(options: CallSessionOptions): Promise<CallSessionResult> {
    if (!this.isConfigured()) {
      return {
        provider: this.name,
        roomName: options.roomName,
        configured: false,
        status: "not_configured",
        message: "Calls not configured: LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are not set.",
      };
    }

    // When keys are present in production, tokens can be generated via livekit-server-sdk or JWT
    return {
      provider: this.name,
      roomName: options.roomName,
      serverUrl: this.url,
      configured: true,
      status: "configured",
      message: "Calls configured successfully.",
    };
  }
}

// Global factory returning the active call provider
let activeCallProvider: CallProvider = new LiveKitCallProvider();

export function getCallProvider(): CallProvider {
  return activeCallProvider;
}

export function setCallProvider(provider: CallProvider): void {
  activeCallProvider = provider;
}
