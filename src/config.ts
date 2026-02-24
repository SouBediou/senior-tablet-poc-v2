export const BACKEND_URL = "https://voice-agent-backend-g3pb.onrender.com";

export const DID_API_KEY = process.env.EXPO_PUBLIC_DID_API_KEY ?? "";

// Debug
console.log("📋 [CONFIG] BACKEND_URL =", BACKEND_URL);
console.log("📋 [CONFIG] DID_API_KEY présente =", DID_API_KEY.length > 0);

export const DID_AGENT_ID = process.env.EXPO_PUBLIC_DID_AGENT_ID ?? "";
export const DID_CLIENT_KEY = process.env.EXPO_PUBLIC_DID_CLIENT_KEY ?? "";