export class CreateUserDTO {
  login: string;
  password: string;
  email: string;
  tel: string;
  dateOfBirth?: Date;
  displayName?: string;
  displayPhoto?: string;
}
