import { RolePermission } from '@role/models/role-permission.model';

export class Role {
  roleId: number;
  roleName: string;
  desc: string;
  permissions: RolePermission[];

  constructor(init: Partial<Role>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<Role>) {
    Object.assign(this, init);
  }
}
