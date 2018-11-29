export class Publication {
  constructor(
    public _id: String,
    public text_field: String,
    public media_field: String,
    public document_field: String,
    public likes: Number,
    public type: String,
    public created_at: String,
    public updated_at: String,
    public user_id: String,
  ) {}
}
