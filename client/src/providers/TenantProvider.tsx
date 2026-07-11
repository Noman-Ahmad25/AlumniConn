import { createContext, useContext, type ReactNode } from "react";
import type { CollegePublicResponse } from "../features/college/api/college";

interface TenantContextType {
    tenant: CollegePublicResponse | null;
}

const TenantContext = createContext<TenantContextType>({ tenant: null });

export function TenantProvider({ children, tenant }: { children: ReactNode; tenant: CollegePublicResponse }) {
    return (
        <TenantContext.Provider value={{ tenant }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}
