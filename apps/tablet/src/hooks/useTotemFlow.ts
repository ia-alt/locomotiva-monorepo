import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { maskCpf, maskBirthDate, toIsoDate } from '../utils/masks'
import { playCheckinSound } from '../providers/notification'

const AUTO_RESET_SECONDS = 20
const INACTIVITY_SECONDS = 10

export type TotemStep = 'idle' | 'cpf' | 'birthdate' | 'confirm' | 'success'

export type UseTotemFlowParams = {
    mode: 'checkin' | 'checkout'
    mutationFn: (input: { cpf: string; birthDate?: string }) => Promise<{ userName: string }>
    lookupFn: (input: { cpf: string }) => Promise<{ userName?: string }>
}

export function useTotemFlow({ mode, mutationFn, lookupFn }: UseTotemFlowParams) {
    const [step, setStep] = useState<TotemStep>('idle')
    const [cpf, setCpfRaw] = useState('')
    const [birthDate, setBirthDateRaw] = useState('')
    const [userName, setUserName] = useState('')
    const [pendingUserName, setPendingUserName] = useState('')
    const [recordedTime, setRecordedTime] = useState('')
    const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
    const [fieldError, setFieldError] = useState<string | null>(null)
    const [notFoundMessage, setNotFoundMessage] = useState<{ title: string; body: string } | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const cpfRef = useRef<any>(null)
    const birthDateRef = useRef<any>(null)

    const clearCountdown = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }

    const clearInactivity = () => {
        if (inactivityRef.current) { clearTimeout(inactivityRef.current); inactivityRef.current = null }
    }

    const resetToIdle = () => {
        clearCountdown()
        clearInactivity()
        setStep('idle')
        setCpfRaw('')
        setBirthDateRaw('')
        setUserName('')
        setPendingUserName('')
        setRecordedTime('')
        setFieldError(null)
    }

    const startInactivity = () => {
        clearInactivity()
        inactivityRef.current = setTimeout(() => resetToIdle(), INACTIVITY_SECONDS * 1000)
    }

    useEffect(() => () => { clearCountdown(); clearInactivity() }, [])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (step === 'cpf') {
            setTimeout(() => cpfRef.current?.focus(), 100)
            startInactivity()
        } else if (step === 'birthdate') {
            setTimeout(() => birthDateRef.current?.focus(), 100)
            startInactivity()
        } else {
            clearInactivity()
        }
    }, [step])

    // Auto-dismiss "not found" modal after 6 seconds
    useEffect(() => {
        if (!notFoundMessage) return
        const t = setTimeout(() => setNotFoundMessage(null), 6000)
        return () => clearTimeout(t)
    }, [notFoundMessage])

    const lookupMutation = useMutation({
        mutationFn: async () => {
            const digits = cpf.replace(/\D/g, '')
            return lookupFn({ cpf: digits })
        },
        onSuccess: (data) => {
            setFieldError(null)
            if (data?.userName) setPendingUserName(data.userName)
            setStep(mode === 'checkout' ? 'confirm' : 'birthdate')
        },
        onError: (err: any) => {
            const msg = err?.message ?? 'Erro ao verificar CPF.'
            if (mode === 'checkout') {
                resetToIdle()
                setNotFoundMessage({ title: '', body: 'O usuário não possui check-in ativo.' })
            } else if (msg.includes('não encontrado')) {
                resetToIdle()
                setNotFoundMessage({ title: 'Cadastro não encontrado', body: 'Você não possui cadastro. Faça seu cadastro pelo QR Code ou procure a administração.' })
            } else {
                setFieldError(msg)
            }
        },
    })

    const mutation = useMutation({
        mutationFn: async () => {
            const digits = cpf.replace(/\D/g, '')
            if (mode === 'checkout') {
                return mutationFn({ cpf: digits })
            }
            return mutationFn({ cpf: digits, birthDate: toIsoDate(birthDate) })
        },
        onSuccess: (result) => {
            clearInactivity()
            playCheckinSound().catch(() => {})
            const now = new Date()
            const hh = now.getHours().toString().padStart(2, '0')
            const mm = now.getMinutes().toString().padStart(2, '0')
            setUserName(result.userName ?? pendingUserName ?? 'Usuário')
            setRecordedTime(`${hh}:${mm}`)
            setFieldError(null)
            setStep('success')
            setCountdown(AUTO_RESET_SECONDS)
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) { resetToIdle(); return AUTO_RESET_SECONDS }
                    return prev - 1
                })
            }, 1000)
        },
        onError: (err: any) => {
            const msg = err?.message ?? 'Erro ao processar. Tente novamente.'
            setFieldError(msg)
        },
    })

    const setCpf = (text: string) => { setCpfRaw(maskCpf(text)); setFieldError(null); startInactivity() }
    const setBirthDate = (text: string) => { setBirthDateRaw(maskBirthDate(text)); setFieldError(null); startInactivity() }

    const startFlow = () => setStep('cpf')

    const handleCpfNext = () => {
        if (cpf.replace(/\D/g, '').length !== 11) {
            setFieldError('Digite um CPF válido (11 dígitos)')
            return
        }
        setFieldError(null)
        lookupMutation.mutate()
    }

    const handleBirthDateSubmit = () => {
        if (birthDate.replace(/\D/g, '').length !== 8) {
            setFieldError('Digite a data completa (DD/MM/AAAA)')
            return
        }
        setFieldError(null)
        mutation.mutate()
    }

    const handleConfirmSubmit = () => {
        mutation.mutate()
    }

    const goBack = () => {
        setFieldError(null)
        if (step === 'cpf') resetToIdle()
        else if (step === 'birthdate' || step === 'confirm') setStep('cpf')
    }

    return {
        step,
        cpf, setCpf,
        birthDate, setBirthDate,
        userName, pendingUserName, recordedTime, countdown,
        fieldError,
        notFoundMessage, dismissNotFoundModal: () => setNotFoundMessage(null),
        cpfRef, birthDateRef,
        startFlow, handleCpfNext, handleBirthDateSubmit, handleConfirmSubmit, goBack, resetToIdle,
        isPending: mutation.isPending,
        isLookupPending: lookupMutation.isPending,
    }
}
