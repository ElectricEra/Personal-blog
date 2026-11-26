import { mulberry32 } from "../logic/random.ts";
import {
  type BotRequest,
  type BotResponse,
  chooseDecision,
  legalDecision,
} from "./chooseAction.ts";

const scope = globalThis as {
  onmessage: ((event: MessageEvent<BotRequest>) => void) | null;
  postMessage?: (message: BotResponse) => void;
};

const inWorker =
  typeof window === "undefined" && typeof scope.postMessage === "function";

if (inWorker && scope.postMessage) {
  const post = scope.postMessage.bind(scope);

  scope.onmessage = (event) => {
    const { requestId, state, difficulty, seed, deadline } = event.data;
    const decision = legalDecision(
      state,
      chooseDecision(state, difficulty, mulberry32(seed), deadline),
    );
    post({ requestId, decision });
  };
}
