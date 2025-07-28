import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPasswordHelper = async (
  plainPassword: string,
): Promise<string> => {
  try {
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Hash error:', error.message);
    } else {
      console.error('Unknown error during hashing:', error);
    }
    throw new Error('Failed to hash password');
  }
};
