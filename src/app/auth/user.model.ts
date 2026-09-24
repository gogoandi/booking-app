export class UserModel {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date,
  ) {}

  get getToken(): string | null {
    if (
      !this._token ||
      !this._tokenExpirationDate ||
      !Number.isFinite(this._tokenExpirationDate.getTime()) ||
      Date.now() >= this._tokenExpirationDate.getTime()
    ) {
      return null;
    }

    return this._token;
  }
}
