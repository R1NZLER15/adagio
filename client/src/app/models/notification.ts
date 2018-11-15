export class Notification {
  constructor(
    public _id: string,
    public receiver_id: string,
    public origin: string,
    public text: string,
    public link: string,
    public type: string,
    public created_at: string,
    public viewed: boolean
  ) {}
}
