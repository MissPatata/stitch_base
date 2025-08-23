import { assign } from 'lodash';

export class DesignImage {
    id: number;
    design_id: string; // not nullable // index
    url: string; // not null
    created_at: Date;

    constructor(data?: Partial<DesignImage>) {
        assign(this, { created_at: new Date() } as DesignImage, data);
    }
}
