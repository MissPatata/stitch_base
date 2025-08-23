import { assign } from 'lodash';

export class DesignSet {
    id: number;
    name: string; // not null
    description: string;
    tags: string[];
    created_at: Date; // auto
    updated_at: Date;

    constructor(data?: Partial<DesignSet>) {
        assign(
            this,
            { created_at: new Date(), updated_at: new Date() } as DesignSet,
            data,
        );
    }
}
