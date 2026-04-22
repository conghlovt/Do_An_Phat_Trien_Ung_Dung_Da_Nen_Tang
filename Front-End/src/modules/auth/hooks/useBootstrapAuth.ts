import { useEffect } from 'react'
import { useAuthStore } from '../store/auth.store'

export function useBootstrapAuth() {
  const finishBootstrap = useAuthStore((s) => s.finishBootstrap)

  useEffect(() => {
    finishBootstrap()
  }, [finishBootstrap])
}