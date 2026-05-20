import React from 'react';
import { DepositPolicy } from '../../../src/partner/components/Policy/DepositPolicy';
import { useRouter } from 'expo-router';

export default function DepositPolicyScreen() {
  const router = useRouter();
  return <DepositPolicy onBack={() => router.back()} />;
}
