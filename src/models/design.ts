export class Design {
    id: number;
    garment_type:  string; // index // not null
    length: string;
    name: string; // not null
    description: string;
    tags: string[];
    collection: string;
    process_status: string;
    created_at: Date // auto
    updated_at: Date // auto

    constructor(data: any){
        this.id = data.id;
        this.garment_type = data.garment_type;
        this.length = data.length;
        this.name = data.name; // not null
        this.description = data.description;
        this.tags = data.tags;
        this.collection = data.collection;
        this.process_status = data.process_status;
        this.created_at = data.created_at// auto
        this.updated_at = data.updated_at// auto
    }
}