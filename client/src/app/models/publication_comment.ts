export class Comment {
  constructor(
    public _id: string,
    public publication_id: string,
    public user_id: string,
    public text_field: string,
    public media_field: string,
    public likes: number,
    public created_at: string,
    public updated_at: string
  ) {}
}
