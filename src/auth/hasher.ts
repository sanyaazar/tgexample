import * as bcrypt from 'bcrypt';

export class Hasher {
  private readonly SALT_ROUNDS = 10;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
