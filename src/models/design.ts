import { assign } from 'lodash';

export class Design {
    id: number;
    garment_type: string; // index // not null
    length: string;
    name: string; // not null
    description: string;
    tags: string[];
    collection: string;
    process_status: string;
    created_at: Date; // auto
    updated_at: Date; // auto

    constructor(data?: Partial<Design>) {
        assign(
            this,
            { created_at: new Date(), updated_at: new Date() } as Design,
            data,
        );
    }
}
