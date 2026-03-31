import { createContext, use } from 'react'
import { RouterUtils } from '@orpc/react-query'
import { RouterClientType } from '../../../api/src/modules/_core/presentation/orpc-server/router'

type ORPCReactUtils = RouterUtils<RouterClientType>

export const ORPCContext = createContext<ORPCReactUtils | undefined>(undefined)

export function useORPC(): ORPCReactUtils {
    const orpc = use(ORPCContext)
    if (!orpc) {
        throw new Error('ORPCContext is not set up properly')
    }
    return orpc
}
