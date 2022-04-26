export class TrustAppAgent {
  appId: number;
  agentId: number;
  agentIp: string;
  desc: string;
  createTime: string;
  createUser: string;

  constructor(init: Partial<TrustAppAgent>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<TrustAppAgent>) {
    Object.assign(this, init);
  }

}
