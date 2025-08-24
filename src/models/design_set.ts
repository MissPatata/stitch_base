import { assign } from 'lodash';
import {
    Entity,
    PrimaryKey,
    Property,
    ManyToMany,
    Collection,
} from '@mikro-orm/core';
import { Design } from './design';
import { nanoid } from 'nanoid';

@Entity()
export class DesignSet {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @Property({ type: 'varchar', length: 200, nullable: false })
    name: string;

    @Property({ type: 'text', nullable: true })
    description?: string;

    @Property({ type: 'json', nullable: true })
    tags?: string[];

    @Property({
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
        onCreate: () => new Date(),
    })
    created_at: Date;

    @Property({
        type: 'datetime',
        default: 'CURRENT_TIMESTAMP',
        onUpdate: () => new Date(),
    })
    updated_at: Date;

    @ManyToMany(() => Design, design => design.designSets, { owner: true })
    designs = new Collection<Design>(this);

    constructor(data?: Partial<DesignSet>) {
        assign(
            this,
            {
                id: nanoid(21),
                created_at: new Date(),
                updated_at: new Date(),
            } as DesignSet,
            data,
        );
    }
}
