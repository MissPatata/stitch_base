export class Pattern {
    id: string;
    garment_type: string;
    length: string;
    name: string;
    description: string;
    url: string;        
    created_at: Date;
    updated_at: Date;

    constructor(data: any){
        this.id = data.id;
        this.garment_type = data.garment_type;
        this.length = data.length;
        this.name = data.name;
        this.description = data.description;
        this.url = data.url;        
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;

    }

}