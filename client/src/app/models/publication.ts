export class Publication {
  constructor(
    public _id: string,
    public text_field: string,
    public media_field: string,
    public document_field: string,
    public likes: number,
    public created_at: string,
    public updated_at: string,
    public user_id: String,
  ) {}
}
