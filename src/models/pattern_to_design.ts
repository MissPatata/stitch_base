import { assign } from 'lodash';
import { Entity, PrimaryKey, ManyToOne, Property } from '@mikro-orm/core';
import { Pattern } from './pattern';
import { Design } from './design';
import { nanoid } from 'nanoid';

@Entity()
export class PatternToDesign {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @ManyToOne(() => Pattern)
    pattern: Pattern;

    @ManyToOne(() => Design)
    design: Design;

    @Property({
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
        onCreate: () => new Date(),
    })
    created_at: Date;

    constructor(data?: Partial<PatternToDesign>) {
        assign(
            this,
            { id: nanoid(21), created_at: new Date() } as PatternToDesign,
            data,
        );
    }
}
