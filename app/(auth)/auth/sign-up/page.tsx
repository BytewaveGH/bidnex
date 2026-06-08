import Signup from './_widgets/signup'

export default function Page({ searchParams }: { searchParams: { type?: string } }) {
  const initialType = searchParams.type === 'vendor' ? 'vendor' : 'bidder'
  return (
    <main className="max-h-screen items-center">
      <Signup initialType={initialType} />
    </main>
  )
}
