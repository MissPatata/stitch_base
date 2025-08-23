import { assign } from 'lodash';

export class Pattern {
    id: string;
    garment_type: string;
    length: string;
    name: string;
    description: string;
    url: string;
    created_at: Date;
    updated_at: Date;

    constructor(data?: Partial<Pattern>) {
        assign(
            this,
            { created_at: new Date(), updated_at: new Date() } as Pattern,
            data,
        );
    }
}
