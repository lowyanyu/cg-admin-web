export class TrustAppToken {
  tokenId: number;
  tokenType: number;
  status: number;
  ip: string;
  createTime: string;
  expireTime: string;
  tokenValue: string;
  appId: number;

  constructor(init: Partial<TrustAppToken>) {
    Object.assign(this, init);
  }

  updatePartical(init: Partial<TrustAppToken>) {
    Object.assign(this, init);
  }

}
