import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export function AuthGuard({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <div className="panel text-center max-w-sm w-full">
            <div className="text-2xl font-mono font-medium mb-2">FOREX AI</div>
            <div className="text-muted text-sm mb-6">
              Professional trading intelligence platform
            </div>
            <SignInButton mode="modal">
              <button className="w-full py-2.5 bg-info text-white rounded-lg text-sm font-medium hover:opacity-90 transition">
                Sign In to Access Dashboard
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  )
}

export function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <UserButton afterSignOutUrl="/" />
    </div>
  )
}
