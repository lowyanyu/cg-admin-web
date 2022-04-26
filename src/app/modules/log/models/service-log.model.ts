export class ServiceLog {
  logId: number;
  rowId: number;
  logDate: number;
  account: {status: number, userAccount: string};
  logType: number; // reserved
  logClass: number;
  clientIp: string;
  serverIp: string;
  operation: number;
  httpStatus: number;
  respCode: number;
  respMsg: string;
  appType: number;
  appInfo: string;
  transactionId: string;

  constructor(init: Partial<ServiceLog>) {
    Object.assign(this, init);
  }
}
