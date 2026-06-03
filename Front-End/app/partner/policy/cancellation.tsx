import React from 'react';
import { CancellationPolicy } from '../../../src/partner/components/Policy/CancellationPolicy';
import { useRouter } from 'expo-router';

export default function CancellationPolicyScreen() {
  const router = useRouter();
  return <CancellationPolicy onBack={() => router.back()} />;
}
