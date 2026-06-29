/**
 * SIP calculator formula.
 * Re-exports sipFutureValue from the shared finance library so the config
 * and any unit tests can import from this co-located file.
 */
export { sipFutureValue } from "../_shared/finance";
export type { SipFutureValueResult } from "../_shared/finance";
