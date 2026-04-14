import { InferClientOutputs, InferClientInputs } from "@orpc/client"
import { RouterClientType } from "../../../api/src/modules/_core/presentation/orpc-server/router"

export type ORPCOutputs = InferClientOutputs<RouterClientType>
export type ORPCInputs = InferClientInputs<RouterClientType>