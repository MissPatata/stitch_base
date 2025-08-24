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
export class Pattern {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @Property({ type: 'varchar', length: 100, nullable: false })
    garment_type: string;

    @Property({ type: 'varchar', length: 50, nullable: false })
    length: string;

    @Property({ type: 'varchar', length: 200, nullable: false })
    name: string;

    @Property({ type: 'text', nullable: true })
    description?: string;

    @Property({ type: 'varchar', length: 500, nullable: false })
    url: string;

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

    @ManyToMany(() => Design, design => design.patterns)
    designs = new Collection<Design>(this);

    constructor(data?: Partial<Pattern>) {
        assign(
            this,
            {
                id: nanoid(21),
                created_at: new Date(),
                updated_at: new Date(),
            } as Pattern,
            data,
        );
    }
}
