import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = (body.customApiKey || process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json({
        ok: false,
        error: "No Google Gemini API key provided or found in environment.",
        hasServerKey: false,
      }, { status: 400 });
    }

    const testModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.5-flash"];
    const startTime = Date.now();

    for (const model of testModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(6000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: "ping" }] }]
          })
        });

        if (res.ok) {
          const latencyMs = Date.now() - startTime;
          return NextResponse.json({
            ok: true,
            activeModel: model,
            latencyMs,
            status: "Connected & Verified",
            message: `Successfully connected to Google Gemini (${model}) in ${latencyMs}ms.`,
            keyMasked: `${apiKey.substring(0, 6)}...${apiKey.slice(-4)}`,
          });
        }
      } catch (err: any) {
        // try next model
      }
    }

    return NextResponse.json({
      ok: false,
      error: "Google Gemini API key was rejected or timed out. Please check your API key from Google AI Studio.",
    }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message || "Internal error testing Gemini key",
    }, { status: 500 });
  }
}
