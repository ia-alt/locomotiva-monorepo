import { FC, PropsWithChildren, useState } from 'react'
import { createORPCClient } from '@orpc/client'
import { link } from './link'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import { ORPCContext } from './context'
import { RouterClientType } from '@locomotiva/api/src/modules/_core/presentation/orpc-server/router'

export const ORPCProvider: FC<PropsWithChildren> = ({ children }) => {
    const [client] = useState<RouterClientType>(() => createORPCClient(link))
    const [orpc] = useState(() => createORPCReactQueryUtils(client))

    return (
        <ORPCContext.Provider value={orpc}>
            {children}
        </ORPCContext.Provider>
    )
}
