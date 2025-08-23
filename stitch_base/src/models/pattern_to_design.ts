export class Pattern_to_design {
    pattern_id: string;
    design_id: string;
    created_at: Date

    constructor(data: any){
        this.pattern_id = data.pattern_id;
        this.design_id = data.design_id;
        this.created_at = data.created_at
  }
}