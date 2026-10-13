import { createContext, useContext, type ReactNode } from "react";
import type { CollegePublicResponse } from "../features/college/api/college";

export interface TenantContextType {
    tenant: CollegePublicResponse | null;
    refreshTenant?: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType>({ tenant: null });

export function TenantProvider({
    children,
    tenant,
    refreshTenant
}: {
    children: ReactNode;
    tenant: CollegePublicResponse;
    refreshTenant?: () => Promise<void>;
}) {
    return (
        <TenantContext.Provider value={{ tenant, refreshTenant }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}
