import type { ReactNode } from 'react'

type Props = {
    children: ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {children}
    </div>
  );
}