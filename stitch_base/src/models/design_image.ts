export class Design_image {
    id: number;
    design_id: string // not nullable // index
    url: string // not null
    created_at: Date

    constructor(data: any){
        this.id = data.id;
        this.design_id = data.design_id // not nullable // index
        this.url = data.url // not null
        this.created_at = data.created_at
    }
}