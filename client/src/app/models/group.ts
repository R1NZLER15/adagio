export class Group {
    constructor(
        public _id: string,
        public name: string,
        public group_link: string,
        public description: string,
        public type: string,
        public category: string,
        public privacy: string,
        public cover: string,
        public banner: string,
        public group_admin: string,
        public created_at: string
    ) {}
}
