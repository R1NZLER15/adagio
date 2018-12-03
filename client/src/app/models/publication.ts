export class Publication {
  constructor(
    public _id: String,
    public text: String,
    public media_file: String,
    public document_file: String,
    public likes: Number,
    public type: String,
    public created_at: String,
    public updated_at: String,
    public user_id: String,
  ) {}
}
