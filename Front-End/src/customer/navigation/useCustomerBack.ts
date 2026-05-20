import { useRouter } from 'expo-router';

export function useCustomerBack(fallback: string = '/customer/dashboard') {
  const router = useRouter();

  return () => {
    const canGoBack = typeof router.canGoBack === 'function' ? router.canGoBack() : false;

    if (canGoBack) {
      router.back();
      return;
    }

    router.replace(fallback as any);
  };
}
