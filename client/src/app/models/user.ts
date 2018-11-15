export class User {
  constructor(
    public _id: string,
    public names: string,
    public fst_surname: string,
    public snd_surname: string,
    public unique_nick: string,
    public email: string,
    public gender: string,
    public password: string,
    public avatar: string,
    public banner: string,
    public about_me: string,
    public join_date: string,
    public birthday: string,
    public role: string,
    public badges: string
  ) {}
}
