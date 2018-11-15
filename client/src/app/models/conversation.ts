export class Conversation {
      constructor(
        public _id: string,
        public user_1: string,
        public user_2: string,
        public last_message: string,
        public updated_at: string
    ) {}
}
