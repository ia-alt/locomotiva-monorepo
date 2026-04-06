import { FC, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { AccessCodeContext } from "../contexts/access-code";
import { useORPC } from "../locomotiva-api/context";

export const AccessCodeProvider: FC<PropsWithChildren> = ({ children }) => {
    const orpc = useORPC();

    const [accessCode, setAccessCode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const refreshAccessCode = useCallback(async () => {
        setLoading(true);
        try {
            const { code } = await orpc.coworking.totem.generateAccessCode.call({})
            setAccessCode(code);
            console.log("Novo Código:", code)
        } catch (error) {
            setError("Erro ao carregar QR Code");
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        refreshAccessCode();
    }, []);

    const value = useMemo(() => ({
        accessCode,
        loading,
        error,
        refreshAccessCode
    }), [accessCode, loading, error, refreshAccessCode]);

    return (
        <AccessCodeContext.Provider value={value}>
            {children}
        </AccessCodeContext.Provider>
    )
}