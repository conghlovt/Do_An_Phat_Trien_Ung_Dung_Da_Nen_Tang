import { useCallback, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { hotelsApi, type OfficeInfo } from '@/src/customer/api/hotels.api';

export function useOfficeInfo() {
  const [officeInfo, setOfficeInfo] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOfficeInfo = useCallback(async (canUpdate: () => boolean = () => true) => {
    setLoading(true);
    try {
      const result = await hotelsApi.getOfficeInfo();
      if (canUpdate()) setOfficeInfo(result.data);
    } catch {
      if (canUpdate()) setOfficeInfo(null);
    } finally {
      if (canUpdate()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadOfficeInfo(() => mounted);

    return () => {
      mounted = false;
    };
  }, [loadOfficeInfo]);

  const openMap = useCallback(() => {
    if (!officeInfo) return;
    void Linking.openURL(`https://maps.google.com/?q=${officeInfo.latitude},${officeInfo.longitude}`);
  }, [officeInfo]);

  return {
    loading,
    officeInfo,
    openMap,
    refresh: loadOfficeInfo,
  };
}
