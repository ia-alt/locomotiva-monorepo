import { errorToOrpcError } from "./error-to-orpc-error"

export async function orpcSafe<T>(fn: () => Promise<T>) {
    try {
        return await fn()
    } catch (error) {
        throw errorToOrpcError(error)
    }
}