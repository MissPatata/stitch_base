import { assign } from 'lodash';
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Design } from './design';
import { nanoid } from 'nanoid';

@Entity()
export class DesignImage {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @ManyToOne(() => Design)
    design: Design;

    @Property({ type: 'varchar', length: 500, nullable: false })
    url: string; // not null

    @Property({
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
        onCreate: () => new Date(),
    })
    created_at: Date;

    constructor(data?: Partial<DesignImage>) {
        assign(
            this,
            { id: nanoid(21), created_at: new Date() } as DesignImage,
            data,
        );
    }
}
