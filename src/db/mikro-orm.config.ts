import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/sqlite';
import { Pattern } from '../models/pattern';
import { Design } from '../models/design';
import { DesignSet } from '../models/design_set';
import { DesignImage } from '../models/design_image';
import { PatternToDesign } from '../models/pattern_to_design';
import { DesignSetToDesign } from '../models/design_set_to_design';

export default defineConfig({
    entities: [
        Pattern,
        Design,
        DesignSet,
        DesignImage,
        PatternToDesign,
        DesignSetToDesign,
    ],
    dbName: './db/stitch_base.db',
    debug: process.env.NODE_ENV === 'development',
    allowGlobalContext: true, // for easier usage in frontend
});
