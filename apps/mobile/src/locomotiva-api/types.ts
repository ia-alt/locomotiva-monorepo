import { InferClientOutputs, InferClientInputs } from "@orpc/client"
import { RouterClientType } from "../../../secti-locomotiva/src/modules/_core/presentation/orpc-server/router"

export type ORPCOutputs = InferClientOutputs<RouterClientType>
export type ORPCInputs = InferClientInputs<RouterClientType>