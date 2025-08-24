import { assign } from 'lodash';
import {
    Entity,
    PrimaryKey,
    Property,
    OneToMany,
    ManyToMany,
    Collection,
    Cascade,
} from '@mikro-orm/core';
import { DesignImage } from './design_image';
import { Pattern } from './pattern';
import { DesignSet } from './design_set';
import { nanoid } from 'nanoid';

@Entity()
export class Design {
    @PrimaryKey({ type: 'varchar', length: 21 })
    id: string;

    @Property({ type: 'varchar', length: 100, nullable: false, index: true })
    garment_type: string;

    @Property({ type: 'varchar', length: 50, nullable: false })
    length: string;

    @Property({ type: 'varchar', length: 200, nullable: false })
    name: string;

    @Property({ type: 'text', nullable: true })
    description?: string;

    @Property({ type: 'json', nullable: true })
    tags?: string[];

    @Property({ type: 'varchar', length: 200, nullable: true })
    collection?: string;

    @Property({ type: 'varchar', length: 50, nullable: true })
    process_status?: string;

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

    @OneToMany(() => DesignImage, image => image.design, {
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
    })
    images = new Collection<DesignImage>(this);

    @ManyToMany(() => Pattern, pattern => pattern.designs, { owner: true })
    patterns = new Collection<Pattern>(this);

    @ManyToMany(() => DesignSet, designSet => designSet.designs)
    designSets = new Collection<DesignSet>(this);

    constructor(data?: Partial<Design>) {
        assign(
            this,
            {
                id: nanoid(21),
                created_at: new Date(),
                updated_at: new Date(),
            } as Design,
            data,
        );
    }
}
