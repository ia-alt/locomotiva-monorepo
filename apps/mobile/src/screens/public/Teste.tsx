import { FC, useState } from "react";
import { Text, View } from "react-native";
import { useORPC } from "../../locomotiva-api/context";
import { useEffect } from "react";

export const Teste: FC = () => {
    const orpc = useORPC()
    const [streaming, setStreaming] = useState<AsyncIterableIterator<{ message: string }>>()
    useEffect(() => {
        orpc.coworking.totem.onCheckin.call({ name: "tomate" }).then((r) => {
            setStreaming(r as AsyncIterableIterator<{ message: string }>)
        })
    }, [])
    useEffect(() => {
        if (!streaming) return
        streaming.next().then(r => {
            console.log("result", r)
        })
    }, [streaming])
    return (
        <View>
            <Text>Teste</Text>
        </View>
    )
}