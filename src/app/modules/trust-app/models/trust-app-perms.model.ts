export class TrustAppPerms {
  permissionId: number;
  permissionName: string;
  permissionClass: string;
  permissionType: number;

  constructor(init: Partial<TrustAppPerms>) {
    Object.assign(this, init);
  }

}
