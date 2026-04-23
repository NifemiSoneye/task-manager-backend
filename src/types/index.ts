export interface IUser {
  username: string;
  password: string;
  email: string;
  refreshToken?: string[];
}

export interface IBoard {
  title: string;
  user: any;
}
