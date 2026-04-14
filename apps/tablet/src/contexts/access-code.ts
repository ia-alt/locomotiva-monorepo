import { createContext } from "react";

export const AccessCodeContext = createContext<AccessCodeContextType>({
    accessCode: "",
    loading: false,
    error: null,
    refreshAccessCode: () => Promise.resolve(),
});

export type AccessCodeContextType = {
    accessCode: string;
    loading: boolean;
    error: string | null;
    refreshAccessCode: () => Promise<void>;
}