import { Role } from '@role/models/role.model';

export class User {
  userId: number;
  userAccount: string;
  userPwd: string;
  userName: string;
  phone: string;
  email: string;
  status: number;
  roles: Role[];
  desc: string;

  constructor(init: Partial<User>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<User>) {
    Object.assign(this, init);
  }
}
