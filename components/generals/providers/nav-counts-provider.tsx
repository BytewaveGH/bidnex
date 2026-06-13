'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAxios } from '@/hooks/use-axios'

type NavCountsContextType = {
  myBidsCount: number
  wonItemsCount: number
}

const NavCountsContext = createContext<NavCountsContextType>({ myBidsCount: 0, wonItemsCount: 0 })

export function NavCountsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const callApi = useAxios()
  const [myBidsCount, setMyBidsCount] = useState(0)
  const [wonItemsCount, setWonItemsCount] = useState(0)

  useEffect(() => {
    if (session?.user?.userType !== 'bidder') return
    callApi({ method: 'GET', url: '/bidder/bids', params: { page: 1, limit: 1 } })
      .then((res: any) => { setMyBidsCount(res.data?.data?.count ?? 0) })
      .catch(() => {})
    callApi({ method: 'GET', url: '/bidder/lots/won', params: { page: 1, limit: 1 } })
      .then((res: any) => { setWonItemsCount(res.data?.data?.count ?? 0) })
      .catch(() => {})
  }, [session?.user?.userType])

  return (
    <NavCountsContext.Provider value={{ myBidsCount, wonItemsCount }}>
      {children}
    </NavCountsContext.Provider>
  )
}

export function useNavCounts() {
  return useContext(NavCountsContext)
}
