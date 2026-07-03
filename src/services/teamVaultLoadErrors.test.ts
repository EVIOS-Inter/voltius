import { classifyTeamObjectListError } from "./teamVaultLoadErrors.ts";
import { test } from "vitest";

test("teamVaultLoadErrors", async () => {
function assertEqual<T>(actual: T, expected: T, msg: string) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg}\n  expected: ${e}\n  actual:   ${a}`);
}

// Classification must key off the machine-readable `status`/`offline` fields,
// not the (translated, locale-dependent) message text. Use French-looking
// messages containing none of the English keywords ("permission",
// "subscription", "network", "connected") to prove locale independence.
const forbiddenFr = Object.assign(new Error("Erreur inconnue du serveur"), { status: 403 });
assertEqual(classifyTeamObjectListError(forbiddenFr), "forbidden", "status 403 -> forbidden regardless of French message text");

const paymentRequiredFr = Object.assign(new Error("Erreur inconnue du serveur"), { status: 402 });
assertEqual(classifyTeamObjectListError(paymentRequiredFr), "payment_required", "status 402 -> payment_required regardless of French message text");

const offlineFr = Object.assign(new Error("Non connecté au serveur"), { offline: true });
assertEqual(classifyTeamObjectListError(offlineFr), "offline", "offline flag -> offline regardless of French message text");

// Legacy fallback: errors without status/offline metadata still classify by
// English message text (back-compat for callers that don't set it).
const legacyForbidden = new Error("403 Forbidden");
assertEqual(classifyTeamObjectListError(legacyForbidden), "forbidden", "legacy text match still works for 403");

const legacyOffline = new Error("network request failed");
assertEqual(classifyTeamObjectListError(legacyOffline), "offline", "legacy text match still works for network");

// Unclassifiable error falls back.
const unknown = new Error("something else entirely");
assertEqual(classifyTeamObjectListError(unknown), "fallback", "unrecognized error falls back");
});
