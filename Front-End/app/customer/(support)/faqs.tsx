import React from 'react';
import { SupportCard } from '@/src/customer/components/support/SupportCard';
import { SupportScreen } from '@/src/customer/components/support/SupportScreen';
import { FAQS } from '@/src/customer/constants/faqs';

export default function FaqsScreen() {
  return (
    <SupportScreen title="Hỏi đáp">
      {FAQS.map((item) => (
        <SupportCard key={item.question} subtitle={item.answer} title={item.question} />
      ))}
    </SupportScreen>
  );
}
