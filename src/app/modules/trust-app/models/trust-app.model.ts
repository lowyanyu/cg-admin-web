import { TrustAppToken } from '@trustApp/models/trust-app-token.model';
import { TrustAppAgent } from '@trustApp/models/trust-app-agent.model';
import { TrustAppPerms } from '@trustApp/models/trust-app-perms.model';

export class TrustApp {

  appId: number;
  appName: string;
  apiKey: string;
  desc: string;
  // tokenNum: number;
  appType: number;
  authType: number;
  agents: TrustAppAgent[];
  // tokens: TrustAppToken[];
  permissions: TrustAppPerms[];

  constructor(init: Partial<TrustApp>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<TrustApp>) {
    Object.assign(this, init);
  }

}
