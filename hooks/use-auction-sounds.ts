'use client'

import { useRef, useEffect } from 'react'

export function useAuctionSounds() {
    const winningRef = useRef<HTMLAudioElement | null>(null)
    const outbidRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        winningRef.current = new Audio('/sounds/winning.wav')
        outbidRef.current = new Audio('/sounds/outbid.wav')
        winningRef.current.preload = 'auto'
        outbidRef.current.preload = 'auto'
    }, [])

    function playWinning() {
        const audio = winningRef.current
        if (!audio) return
        audio.currentTime = 0
        audio.play().catch(() => {})
    }

    function playOutbid() {
        const audio = outbidRef.current
        if (!audio) return
        audio.currentTime = 0
        audio.play().catch(() => {})
    }

    return { playWinning, playOutbid }
}
