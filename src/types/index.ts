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

export interface ITask {
  title: string;
  description?: string;
  priority: string;
  dueDate: Date;
  status: string;
  order: Number;
  board: any;
}
