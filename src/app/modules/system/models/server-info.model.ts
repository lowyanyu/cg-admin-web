export class ServerInfo {
  coreVersion: string;
  status: string;
  uiVersion: string;
  authorizedSerialNumber: string;
  productName: string;
  accessFrom: string;
  accessTo: string;
  authorizedTarget: string;

  constructor(init: Partial<ServerInfo>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<ServerInfo>) {
    Object.assign(this, init);
  }

}
