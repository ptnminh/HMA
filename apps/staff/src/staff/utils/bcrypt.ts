import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  encrypted_password: string,
) => {
  return bcrypt.compare(password, encrypted_password);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
