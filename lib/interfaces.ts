import { StaticImageData } from 'next/image'

export interface ProductCardType {
    id: number
    image: StaticImageData | string
    condition: 'new' | 'good' | string
    quantity: number
    timeRemaining: string
    bidders: number
    productName: string
    marketPrice: string
    currentBid:     number  
    increment: number
}

export interface CategoryType {
    id: number
    name: string | React.ReactNode
    image: StaticImageData | string
    description?: React.ReactNode
}