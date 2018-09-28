import { InjectionToken } from '@angular/core';
import { PermissionTransfer } from '@neoskop/hrbac';


export interface IRoles {
    [role : string] : string[]
}

export interface HrbacConfiguration {
    defaultRole : string;
    roles? : IRoles;
    permissions? : PermissionTransfer;
}

export const _CONFIG = new InjectionToken<Partial<HrbacConfiguration>>('_HRBAC_CONFIG');
export const CONFIG = new InjectionToken<HrbacConfiguration>('HRBAC_CONFIG');
