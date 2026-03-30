import React from 'react'
import { TotemLayout } from '../components/TotemLayout'
import { useORPC } from '../locomotiva-api/context'

const BLUE = '#1A7BFF'

export default function TotemScreen() {
    const orpc = useORPC()

    return (
        <TotemLayout
            mode="checkin"
            color={BLUE}
            lookupFn={(input) => (orpc.coworking.findMemberByCpf as any).call(input)}
            mutationFn={(input) => (orpc.coworking.checkinByCpf as any).call(input)}
            idleIcon="account-key"
            idleTitle={'Bem-vindo ao\nLocomotiva Hub'}
            idleSub="Toque no botão abaixo para registrar sua entrada"
            idleButtonLabel="Fazer Check-in com CPF"
            submitButtonLabel="Fazer Check-in"
            submitButtonIcon="login"
            successTitle="Check-in Realizado!"
            successGreeting="Bem-vindo(a),"
            successTimeLabel="Entrada registrada às"
            countdownPillBg="#E0F2FE"
            countdownPillText="#0369A1"
        />
    )
}
