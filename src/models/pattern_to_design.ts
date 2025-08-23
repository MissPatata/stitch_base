import { assign } from 'lodash';

export class PatternToDesign {
    pattern_id: string;
    design_id: string;
    created_at: Date;

    constructor(data?: Partial<PatternToDesign>) {
        assign(this, { created_at: new Date() } as PatternToDesign, data);
    }
}
