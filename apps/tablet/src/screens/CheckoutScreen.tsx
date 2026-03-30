import React from 'react'
import { TotemLayout } from '../components/TotemLayout'
import { useORPC } from '../locomotiva-api/context'

const GREEN = '#0F9B6E'

export default function CheckoutScreen() {
    const orpc = useORPC()

    return (
        <TotemLayout
            mode="checkout"
            color={GREEN}
            lookupFn={(input) => (orpc.coworking.findActiveMemberByCpf as any).call(input)}
            mutationFn={(input) => (orpc.coworking.quickCheckoutByCpf as any).call(input)}
            idleIcon="account-arrow-right"
            idleTitle={'Até logo!\nRegistre sua saída'}
            idleSub="Toque no botão abaixo para registrar sua saída"
            idleButtonLabel="Fazer Check-out com CPF"
            submitButtonLabel="Fazer Check-out"
            submitButtonIcon="logout"
            successTitle="Check-out Realizado!"
            successGreeting="Até logo,"
            successTimeLabel="Saída registrada às"
            countdownPillBg="#DCFCE7"
            countdownPillText="#166534"
        />
    )
}
