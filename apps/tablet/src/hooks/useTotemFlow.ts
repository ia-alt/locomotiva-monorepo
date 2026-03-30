import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { maskCpf, maskBirthDate, toIsoDate } from '../utils/masks'

const AUTO_RESET_SECONDS = 20

export type TotemStep = 'idle' | 'cpf' | 'birthdate' | 'success'

export type UseTotemFlowParams = {
    mutationFn: (input: { cpf: string; birthDate: string }) => Promise<{ userName: string }>
}

export function useTotemFlow({ mutationFn }: UseTotemFlowParams) {
    const [step, setStep] = useState<TotemStep>('idle')
    const [cpf, setCpfRaw] = useState('')
    const [birthDate, setBirthDateRaw] = useState('')
    const [userName, setUserName] = useState('')
    const [recordedTime, setRecordedTime] = useState('')
    const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
    const [fieldError, setFieldError] = useState<string | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const cpfRef = useRef<any>(null)
    const birthDateRef = useRef<any>(null)

    const clearTimer = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    }

    const resetToIdle = () => {
        clearTimer()
        setStep('idle')
        setCpfRaw('')
        setBirthDateRaw('')
        setUserName('')
        setRecordedTime('')
        setFieldError(null)
    }

    useEffect(() => () => clearTimer(), [])

    useEffect(() => {
        if (step === 'cpf') setTimeout(() => cpfRef.current?.focus(), 100)
        if (step === 'birthdate') setTimeout(() => birthDateRef.current?.focus(), 100)
    }, [step])

    const mutation = useMutation({
        mutationFn: async () => {
            const digits = cpf.replace(/\D/g, '')
            const isoDate = toIsoDate(birthDate)
            return mutationFn({ cpf: digits, birthDate: isoDate })
        },
        onSuccess: (result) => {
            const now = new Date()
            const hh = now.getHours().toString().padStart(2, '0')
            const mm = now.getMinutes().toString().padStart(2, '0')
            setUserName(result.userName ?? 'Usuário')
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
            if (msg.includes('não encontrado')) setStep('cpf')
            setFieldError(msg)
        },
    })

    const setCpf = (text: string) => { setCpfRaw(maskCpf(text)); setFieldError(null) }
    const setBirthDate = (text: string) => { setBirthDateRaw(maskBirthDate(text)); setFieldError(null) }

    const startFlow = () => setStep('cpf')

    const handleCpfNext = () => {
        if (cpf.replace(/\D/g, '').length !== 11) {
            setFieldError('Digite um CPF válido (11 dígitos)')
            return
        }
        setFieldError(null)
        setStep('birthdate')
    }

    const handleBirthDateSubmit = () => {
        if (birthDate.replace(/\D/g, '').length !== 8) {
            setFieldError('Digite a data completa (DD/MM/AAAA)')
            return
        }
        setFieldError(null)
        mutation.mutate()
    }

    const goBack = () => {
        setFieldError(null)
        if (step === 'cpf') resetToIdle()
        else if (step === 'birthdate') setStep('cpf')
    }

    return {
        step,
        cpf, setCpf,
        birthDate, setBirthDate,
        userName, recordedTime, countdown,
        fieldError,
        cpfRef, birthDateRef,
        startFlow, handleCpfNext, handleBirthDateSubmit, goBack, resetToIdle,
        isPending: mutation.isPending,
    }
}
