export class ManagerLog {
  logId: number;
  logDate: number;
  account: Account; // userAccount status
  logClass: number;
  clientIP: string;
  operation: number;
  logType: string; // reserved
  respCode: number;
  respMsg: string;
}
