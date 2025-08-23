import { assign } from 'lodash';

export class DesignSetToDesign {
    design_set_id: string;
    design_id: string;
    created_at: Date;

    constructor(data?: Partial<DesignSetToDesign>) {
        assign(this, { created_at: new Date() } as DesignSetToDesign, data);
    }
}
