export class Design_set{
    id: number;
    name: string; // not null
    description: string;
    tags: string[];
    created_at: Date// auto
    updated_at: Date

    constructor(data: any){
        this.id = data.id;
        this.name = data.name; // not null
        this.description = data.description;
        this.tags = data.tags;
        this.created_at = data.created_at// auto
        this.updated_at = data.updated_at
    }
}