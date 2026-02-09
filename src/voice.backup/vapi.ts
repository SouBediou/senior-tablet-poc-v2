// src/voice/vapi.ts
import Vapi from "@vapi-ai/react-native";

export type VapiUIStatus = "idle" | "connecting" | "in-call" | "ended" | "error";

let vapiSingleton: Vapi | null = null;

function getKey() {
  const key = (process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY || "").trim();
  if (!key) throw new Error("Missing EXPO_PUBLIC_VAPI_PUBLIC_KEY");
  return key;
}

export function getVapi(): Vapi {
  if (!vapiSingleton) {
    vapiSingleton = new Vapi(getKey());
  }
  return vapiSingleton;
}

export function subscribeVapiStatus(onStatus: (status: VapiUIStatus) => void) {
  const vapi = getVapi();

  const onCallStart = () => onStatus("in-call");
  const onCallEnd = () => onStatus("ended");
  const onError = () => onStatus("error");

  vapi.on("call-start", onCallStart);
  vapi.on("call-end", onCallEnd);
  vapi.on("error", onError);

  return () => {
    // selon version SDK, removeAllListeners peut exister ou non
    // on fait safe:
    // @ts-ignore
    if (typeof vapi.off === "function") {
      // @ts-ignore
      vapi.off("call-start", onCallStart);
      // @ts-ignore
      vapi.off("call-end", onCallEnd);
      // @ts-ignore
      vapi.off("error", onError);
    }
  };
}
