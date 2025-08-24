import { initDatabase, getEntityManager, closeDatabase } from '../database';
import { Pattern } from '../../models/pattern';
import { Design } from '../../models/design';
import { DesignSet } from '../../models/design_set';
import { DesignImage } from '../../models/design_image';

describe('MikroORM Integration Tests', () => {
    beforeAll(async () => {
        // Use forceReset=true for testing to start with clean database
        await initDatabase(true);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        // Clean database before each test (order matters for foreign keys)
        const em = getEntityManager();

        // Clear junction tables first (foreign key constraints)
        await em.getConnection().execute('DELETE FROM pattern_to_design');
        await em.getConnection().execute('DELETE FROM design_set_to_design');

        // Then clear dependent entities
        await em.nativeDelete(DesignImage, {});

        // Finally clear main entities
        await em.nativeDelete(DesignSet, {});
        await em.nativeDelete(Design, {});
        await em.nativeDelete(Pattern, {});
    });

    describe('Entity Creation', () => {
        it('should create a Pattern entity', async () => {
            const em = getEntityManager();

            const pattern = new Pattern({
                id: 'pattern-001',
                name: 'Basic Dress Pattern',
                garment_type: 'dress',
                length: 'midi',
                description: 'A simple midi dress pattern',
                url: 'https://example.com/pattern1.pdf',
            });

            await em.persistAndFlush(pattern);

            expect(pattern.id).toBe('pattern-001');
            expect(pattern.name).toBe('Basic Dress Pattern');

            const count = await em.count(Pattern, {});
            expect(count).toBe(1);
        });

        it('should create a Design entity', async () => {
            const em = getEntityManager();

            const design = new Design({
                name: 'Summer Dress',
                garment_type: 'dress',
                length: 'midi',
                description: 'A beautiful summer dress',
                tags: ['summer', 'casual', 'midi'],
                collection: 'Summer 2024',
            });

            await em.persistAndFlush(design);

            expect(design.name).toBe('Summer Dress');
            expect(design.tags).toEqual(['summer', 'casual', 'midi']);
            expect(design.id).toBeDefined();

            const count = await em.count(Design, {});
            expect(count).toBe(1);
        });

        it('should create a DesignSet entity', async () => {
            const em = getEntityManager();

            const designSet = new DesignSet({
                name: 'Summer Collection 2024',
                description: 'All summer designs',
                tags: ['summer', 'collection'],
            });

            await em.persistAndFlush(designSet);

            expect(designSet.name).toBe('Summer Collection 2024');
            expect(designSet.tags).toEqual(['summer', 'collection']);

            const count = await em.count(DesignSet, {});
            expect(count).toBe(1);
        });
    });

    describe('Relationships', () => {
        it('should create many-to-many relationships between Pattern and Design', async () => {
            const em = getEntityManager();

            const pattern = new Pattern({
                id: 'pattern-001',
                name: 'Basic Dress Pattern',
                garment_type: 'dress',
                length: 'midi',
                url: 'https://example.com/pattern1.pdf',
            });

            const design = new Design({
                name: 'Summer Dress',
                garment_type: 'dress',
                length: 'midi',
                description: 'A beautiful summer dress',
                collection: 'Summer 2024',
            });

            await em.persistAndFlush([pattern, design]);

            // Link pattern to design
            design.patterns.add(pattern);
            await em.persistAndFlush(design);

            // Query with relationship populated
            const designWithPatterns = await em.findOne(
                Design,
                { id: design.id },
                { populate: ['patterns'] },
            );

            expect(designWithPatterns?.patterns.length).toBe(1);
            expect(designWithPatterns?.patterns[0].name).toBe(
                'Basic Dress Pattern',
            );
        });

        it('should create one-to-many relationships between Design and DesignImage', async () => {
            const em = getEntityManager();

            const design = new Design({
                name: 'Summer Dress',
                garment_type: 'dress',
                length: 'midi',
                description: 'A beautiful summer dress',
                collection: 'Summer 2024',
            });

            await em.persistAndFlush(design);

            const image1 = new DesignImage({
                url: 'https://example.com/image1.jpg',
            });
            image1.design = design;

            const image2 = new DesignImage({
                url: 'https://example.com/image2.jpg',
            });
            image2.design = design;

            design.images.add(image1, image2);
            await em.persistAndFlush([image1, image2]);

            // Query with images populated
            const designWithImages = await em.findOne(
                Design,
                { id: design.id },
                { populate: ['images'] },
            );

            expect(designWithImages?.images.length).toBe(2);
            expect(designWithImages?.images[0].url).toBe(
                'https://example.com/image1.jpg',
            );
            expect(designWithImages?.images[1].url).toBe(
                'https://example.com/image2.jpg',
            );
        });

        it('should access foreign key through design_id getter', async () => {
            const em = getEntityManager();

            const design = new Design({
                name: 'Test Design',
                garment_type: 'shirt',
                length: 'short',
            });

            await em.persistAndFlush(design);

            const image = new DesignImage({
                url: 'https://example.com/test.jpg',
            });
            image.design = design;
            await em.persistAndFlush(image);

            // Test foreign key access via getter
            expect(image.design.id).toBe(design.id);
        });
    });

    describe('Cascade Operations', () => {
        it('should cascade delete images when design is deleted', async () => {
            const em = getEntityManager();

            const design = new Design({
                name: 'Test Design',
                garment_type: 'dress',
                length: 'midi',
            });

            await em.persistAndFlush(design);

            const image1 = new DesignImage({
                url: 'https://example.com/image1.jpg',
            });
            image1.design = design;

            const image2 = new DesignImage({
                url: 'https://example.com/image2.jpg',
            });
            image2.design = design;

            design.images.add(image1, image2);
            await em.persistAndFlush([image1, image2]);

            // Verify images exist
            const imageCountBefore = await em.count(DesignImage, {});
            expect(imageCountBefore).toBe(2);

            // Delete design (should cascade to images)
            await em.removeAndFlush(design);

            // Verify images were cascaded
            const imageCountAfter = await em.count(DesignImage, {});
            expect(imageCountAfter).toBe(0);
        });
    });

    describe('CRUD Operations', () => {
        it('should update entity properties', async () => {
            const em = getEntityManager();

            const design = new Design({
                name: 'Original Name',
                garment_type: 'dress',
                length: 'midi',
                description: 'Original description',
            });

            await em.persistAndFlush(design);

            // Update properties
            design.name = 'Updated Name';
            design.description = 'Updated description';
            await em.persistAndFlush(design);

            // Verify updates
            const updatedDesign = await em.findOne(Design, { id: design.id });
            expect(updatedDesign?.name).toBe('Updated Name');
            expect(updatedDesign?.description).toBe('Updated description');
        });

        it('should query entities with conditions', async () => {
            const em = getEntityManager();

            const design1 = new Design({
                name: 'Dress Design',
                garment_type: 'dress',
                length: 'midi',
            });

            const design2 = new Design({
                name: 'Shirt Design',
                garment_type: 'shirt',
                length: 'short',
            });

            await em.persistAndFlush([design1, design2]);

            // Query by garment type
            const dressDesigns = await em.find(Design, {
                garment_type: 'dress',
            });
            const shirtDesigns = await em.find(Design, {
                garment_type: 'shirt',
            });

            expect(dressDesigns.length).toBe(1);
            expect(shirtDesigns.length).toBe(1);
            expect(dressDesigns[0].name).toBe('Dress Design');
            expect(shirtDesigns[0].name).toBe('Shirt Design');
        });
    });
});
