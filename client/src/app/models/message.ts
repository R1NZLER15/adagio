export class Message {
    constructor(
      public _id: string,
      public text_field: string,
      public media_field: string,
      public document_field: string,
      public viewed: string,
      public created_at: string,
      public emitter: string,
      public receiver: string
    ) {}
}
