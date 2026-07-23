'use client'
import React, { useEffect, useState } from 'react'
import ButtonTemplate from '../templates/button-template'
import InputTemplate from '../templates/input-template'
import Logo from '../templates/logo'
import { useRouter } from 'next/navigation'
import { Armchair, CarFront, CookingPot, MonitorSmartphone, SearchIcon, Shirt, Smartphone, Menu, X, Tv } from 'lucide-react'
import legalHammer from '@/assets/svgs/legal-hammer.svg'
import champion from '@/assets/svgs/champion.svg'
import favoriteIcon from '@/assets/svgs/eye.svg'

import Image from 'next/image'
import HoverCardTemplate from '@/components/templates/hover-card-template'
import electronics from '@/assets/images/electronics.png'
import clothing from '@/assets/images/clothing.png'
import car from '@/assets/images/car.png'
import office from '@/assets/images/office.png'
import phoneAccessories from '@/assets/images/phone-accessories.png'
import utensils from '@/assets/images/utensils.png'
import { useSession, signOut } from 'next-auth/react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BadgeCheck, Bell, Check, CreditCard, LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWatchlistIds } from '@/app/(bidder)/bidder/(all-items)/_logics/useWatchlistIds'
import { useNavCounts } from '@/components/generals/providers/nav-counts-provider'
import { SwitchAccountDialog } from '@/components/generals/switch-account/switch-account-dialog'


const categoriesHoverItems = [
  { icon: MonitorSmartphone, title: 'Electronics', description: 'Find monitors, tvs, headsets, etc', image: electronics },
  { icon: Armchair, title: 'Office Products', description: 'Find office chairs, lamps, desks, etc', image: office },
  { icon: Shirt, title: 'Clothing', description: 'Find shirts, sneakers, dresses, etc', image: clothing },
  { icon: Smartphone, title: 'Phones & Accessories', description: 'Find phones, cases, Chargers, etc', image: phoneAccessories },
  { icon: CookingPot, title: 'Home/Kitchen', description: 'Find air fryer, duvet, utensils, etc', image: utensils },
  { icon: CarFront, title: 'Car Parts', description: 'Find shaft, brake pads, jumper etc', image: car },
] as const


export default function TopNav({ onSearch, initialSearchValue }: { onSearch?: (query: string) => void; initialSearchValue?: string } = {}) {
  const router = useRouter()
  const { data: session } = useSession()
  const isSignedIn = !!session?.user
  const [navItems] = useState<{ name: string, path: string }[]>([
    { name: 'All Items', path: '/bidder/all-items' },
    { name: 'Auction Warehouse', path: '/bidder/auction-warehouse' },
    { name: 'Buy Now', path: '/bidder/buy-now' },
    { name: 'Popular', path: '/bidder/popular' },
    { name: 'BidStream', path: '/bidder/bid-stream' },
  ])
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState(initialSearchValue ?? '')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false)
  const [showSellBadge, setShowSellBadge] = useState(false)
  const { count: watchlistCount } = useWatchlistIds()
  const { myBidsCount, wonItemsCount } = useNavCounts()
  const navIcons = [
    { src: legalHammer, label: 'My Bids', href: '/bidder/my-bids', count: myBidsCount },
    { src: favoriteIcon, label: 'Watchlist', href: '/bidder/watchlist', count: watchlistCount },
    { src: champion, label: 'Won Items', href: '/bidder/won-items', count: wonItemsCount },
  ]

  const totalCount = (myBidsCount ?? 0) + (watchlistCount ?? 0) + (wonItemsCount ?? 0)

  // Pages that care about search (all-items, buy-now, popular) pass their own
  // onSearch to filter in place. Everywhere else — home, product details,
  // auction warehouse — there's no local search to run, so send the query to
  // All Items instead of silently dropping it.
  function handleSearch(query: string) {
    if (onSearch) {
      onSearch(query)
      return
    }
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/bidder/all-items?search=${encodeURIComponent(trimmed)}`)
  }

  function handleNavAndClose(path: string) {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const sellBadgeKey = session?.user?.userId ? `sell-badge-seen:${session.user.userId}` : null

  useEffect(() => {
    if (!sellBadgeKey) return
    setShowSellBadge(!localStorage.getItem(sellBadgeKey))
  }, [sellBadgeKey])

  function openSwitchToVendor() {
    if (sellBadgeKey) localStorage.setItem(sellBadgeKey, '1')
    setShowSellBadge(false)
    setSwitchDialogOpen(true)
  }

  return (
    <div className="sticky top-0 z-50 bg-white">

      {/* ── Desktop top bar ── */}
      <section className="py-3 hidden sm:block">
        <div className="page-container flex justify-between items-center gap-4 min-w-0">
          <Logo />
          <div className="flex-1 min-w-0 md:max-w-[600px] h-[40px] shadow-none rounded-[100px]">
            <InputTemplate
              icon={<SearchIcon />}
              placeholder="Search for anything"
              className="flex-1 min-w-0 md:max-w-[600px] h-[40px] shadow-none rounded-[100px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch(searchQuery)
              }}
            />
          </div>
          {isSignedIn ? (
            <div className='flex gap-2 sm:gap-5 shrink-0 items-center'>
              <TooltipProvider>
                {navIcons.map((icon, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className='relative flex items-center justify-center border rounded-full p-2 cursor-pointer'
                        onClick={() => icon.href && router.push(icon.href)}
                      >
                        <Image src={icon.src} alt={icon.label} className='size-5' />
                        {!!icon.count && (
                          <span className='absolute -top-3 -right-2 flex size-5.5 items-center justify-center rounded-full bg-[#344054] text-[10px] font-medium text-white'>
                            {icon.count}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{icon.label}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="size-8 rounded-lg cursor-pointer">
                          <AvatarFallback>{session?.user?.username?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Profile</TooltipContent>
                    <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
                      <DropdownMenuItem className={cn("p-0", "bg-accent/50")}>
                        <div className="flex w-full items-center gap-2 px-1 py-1.5">
                          <Avatar className="size-9 rounded-lg">
                            <AvatarFallback>{session?.user?.username?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
                          </Avatar>
                          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{session?.user?.username}</span>
                            <span className="truncate text-xs ">{session?.user?.email}</span>
                          </div>
                          <span className="mr-1 flex size-5 items-center justify-center rounded-full text-primary opacity-100">
                            <Check aria-hidden="true" />
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openSwitchToVendor}>
                        <Store />
                        Sell your items
                        {showSellBadge && (
                          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FBCA08] text-black">
                            New
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => router.push('/bidder/profile')}>
                          <BadgeCheck />
                          Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/bidder/billing')}>
                          <CreditCard />
                          Orders & Returns
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell />
                          Notifications
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/auth/login' })}>
                        <LogOut />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Tooltip>
              </TooltipProvider>
            </div>
          ) : (
            <div className="flex gap-2 shrink-0">
              <ButtonTemplate
                className="bg-white text-[#344054] border whitespace-nowrap hover:bg-white"
                title="Login"
                onClick={() => router.push('/auth/login')}
              />
              <ButtonTemplate
                title="Sign up"
                onClick={() => router.push('/auth/sign-up')}
                className="whitespace-nowrap"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Mobile top bar ── */}
      <section className="py-3 sm:hidden border-b border-[#F0F2F5]">
        <div className="page-container flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="relative flex items-center justify-center size-9 rounded-full border border-[#E4E7EC] bg-white"
              >
                {isMobileMenuOpen
                  ? <X className="size-4 text-[#344054]" />
                  : <Menu className="size-4 text-[#344054]" />
                }
                {totalCount > 0 && !isMobileMenuOpen && (
                  <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#344054] text-[9px] font-medium text-white">
                    {totalCount > 9 ? '9+' : totalCount}
                  </span>
                )}
              </button>
            ) : (
              <>
                <ButtonTemplate
                  className="bg-white text-[#344054] border whitespace-nowrap hover:bg-white h-8 text-xs px-3"
                  title="Login"
                  onClick={() => router.push('/auth/login')}
                />
                <ButtonTemplate
                  title="Sign up"
                  onClick={() => router.push('/auth/sign-up')}
                  className="whitespace-nowrap h-8 text-xs px-3"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Mobile dropdown menu ── */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-[61px] left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto">
          {/* Search */}
          <div className="px-4 py-3 border-b border-[#F0F2F5]">
            <InputTemplate
              icon={<SearchIcon />}
              placeholder="Search for anything"
              className="w-full h-[40px] shadow-none rounded-[100px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery)
                  setIsMobileMenuOpen(false)
                }
              }}
            />
          </div>

          {/* Nav icon links */}
          <div className="px-2 py-2 border-b border-[#F0F2F5]">
            {navIcons.map((icon) => (
              <button
                key={icon.label}
                onClick={() => handleNavAndClose(icon.href)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left"
              >
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E4E7EC]">
                  <Image src={icon.src} alt={icon.label} className="size-5" />
                  {!!icon.count && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#344054] text-[9px] font-medium text-white">
                      {icon.count}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-[#344054]">{icon.label}</span>
                {!!icon.count && (
                  <span className="ml-auto text-xs text-[#657688]">{icon.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Page nav links */}
          <div className="px-2 py-2 border-b border-[#F0F2F5]">
            {navItems.filter((item) => item.name !== 'BidStream').map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavAndClose(item.path)}
                className="w-full flex items-center px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left text-sm font-medium text-[#344054]"
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Account actions */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback>{session?.user?.username?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#344054] truncate">{session?.user?.username}</p>
                <p className="text-xs text-[#657688] truncate">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleNavAndClose('/bidder/profile')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left"
            >
              <BadgeCheck className="size-4 text-[#657688]" />
              <span className="text-sm text-[#344054]">Account</span>
            </button>
            <button
              onClick={() => handleNavAndClose('/bidder/billing')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left"
            >
              <CreditCard className="size-4 text-[#657688]" />
              <span className="text-sm text-[#344054]">Orders & Returns</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                openSwitchToVendor()
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F9FAFB] transition-colors text-left"
            >
              <Store className="size-4 text-[#657688]" />
              <span className="text-sm text-[#344054]">Sell your items</span>
              {showSellBadge && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FBCA08] text-black">
                  New
                </span>
              )}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FFF1F0] transition-colors text-left"
            >
              <LogOut className="size-4 text-[#D42620]" />
              <span className="text-sm text-[#D42620]">Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Nav links bar (all screens) ── */}
      <section className="flex items-center justify-center bg-black gap-6 sm:gap-10 text-white text-sm font-semibold h-[50px] overflow-x-auto">
        {navItems.map((item, index) =>
          item.name === 'Categories' ? (
            <HoverCardTemplate
              key={index}
              trigger={
                <span className='cursor-pointer hover:underline' onClick={() => router.push('/bidder/categories')}>{item.name}</span>
              }
              contentClassName=" w-full p-0 overflow-hidden rounded-xl flex-row mt-6"
              content={
                <div className='flex p-3 px-3 bg-white'>
                  <div className="flex-2 grid grid-cols-2 gap-x-0 gap-y-0">
                    {categoriesHoverItems.map((cat, index) => {
                      const Icon = cat.icon
                      return (
                        <div
                          key={cat.title}
                          className="flex items-start gap-3 rounded-sm p-3 cursor-pointer hover:bg-[#F0F2F5] transition-colors"
                          onMouseEnter={() => setHoveredCategoryIndex(index)}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center bg-white border rounded-xs p-1">
                            <Icon className="size-5 text-[#000000]" strokeWidth={1.5} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-normal text-[#2A3239] text-xs sm:text-sm">{cat.title}</div>
                            <div className="text-[#637485] text-[8px] sm:text-[10px] mt-0.5">{cat.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-[#252525] rounded-xl p-8 ml-4 flex flex-col gap-4 w-[220px]">
                    <Image
                      height={105}
                      src={categoriesHoverItems[hoveredCategoryIndex].image}
                      alt={categoriesHoverItems[hoveredCategoryIndex].title}
                      className="object-cover w-full h-[105px] object-center transition-opacity duration-200"
                    />
                  </div>
                </div>
              }
            />
          ) : (
            <span
              key={index}
              className={cn(
                'cursor-pointer hover:underline',
                item.name === 'BidStream' && 'hidden sm:inline-block',
              )}
              onClick={() => router.push(item.path)}
            >
              {item.name}
            </span>
          )
        )}
      </section>

      {/* Bid Stream floating action button (mobile only) */}
      <div className="sm:hidden fixed bottom-6 right-4 z-40">
        <span className="absolute inset-0 rounded-full bg-[#FBCA08] opacity-60 animate-ping" />
        <button
          type="button"
          onClick={() => router.push('/bidder/bid-stream')}
          aria-label="Watch Bid Stream — Live Now"
          className="relative flex items-center gap-1.5 h-11 pl-3 pr-4 rounded-full bg-[#FBCA08] text-black shadow-lg hover:brightness-105 transition-[filter] cursor-pointer"
        >
          <Tv className="size-4" />
          <span className="text-xs font-bold tracking-wide">LIVE</span>
        </button>
      </div>

      <SwitchAccountDialog
        open={switchDialogOpen}
        onOpenChange={setSwitchDialogOpen}
        username={session?.user?.username ?? ''}
        targetRole="vendor"
      />
    </div>
  )
}
