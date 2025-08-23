export class Design_set_to_design{
    design_set_id: string;
    design_id: string;
    created_at: Date

    constructor(data: any){
        this.design_set_id = data.design_set_id;
        this.design_id = data.design_id;
        this.created_at = data.created_at
    }
}