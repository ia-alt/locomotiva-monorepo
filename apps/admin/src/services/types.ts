import type { InferClientOutputs, InferClientInputs } from "@orpc/client"
import type { RouterClientType } from "@backend/_core/presentation/orpc-server/router"

export type ORPCOutputs = InferClientOutputs<RouterClientType>
export type ORPCInputs = InferClientInputs<RouterClientType>
