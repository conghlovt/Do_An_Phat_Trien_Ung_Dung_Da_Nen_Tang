import React, { createContext, useContext } from 'react';

export const CUSTOMER_WEB_SIDEBAR_EXPANDED = 318;
export const CUSTOMER_WEB_SIDEBAR_COLLAPSED = 92;

type CustomerWebShellValue = {
  isWebLayout: boolean;
  sidebarWidth: number;
};

const CustomerWebShellContext = createContext<CustomerWebShellValue>({
  isWebLayout: false,
  sidebarWidth: 0,
});

export function CustomerWebShellProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: CustomerWebShellValue;
}) {
  return (
    <CustomerWebShellContext.Provider value={value}>
      {children}
    </CustomerWebShellContext.Provider>
  );
}

export function useCustomerWebShell() {
  return useContext(CustomerWebShellContext);
}

export function getCustomerWebModalFrame(sidebarWidth: number) {
  return {
    height: '100vh',
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
  } as any;
}
