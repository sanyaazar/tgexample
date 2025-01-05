export type PasswordRecoveryDTO = {
  userID: number;
  code: string;
  expiresAt: Date;
};
