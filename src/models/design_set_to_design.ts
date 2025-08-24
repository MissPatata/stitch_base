import { assign } from 'lodash';
import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { DesignSet } from './design_set';
import { Design } from './design';
import { nanoid } from 'nanoid';

@Entity()
export class DesignSetToDesign {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @ManyToOne(() => DesignSet)
    designSet: DesignSet;

    @ManyToOne(() => Design)
    design: Design;

    @Property({
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
        onCreate: () => new Date(),
    })
    created_at: Date;

    constructor(data?: Partial<DesignSetToDesign>) {
        assign(
            this,
            { id: nanoid(21), created_at: new Date() } as DesignSetToDesign,
            data,
        );
    }
}
