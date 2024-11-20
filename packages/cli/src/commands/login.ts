import { Command, Flags } from '@oclif/core';

import { signInWithEmailPassword } from '../utils.js';

class LoginCommand extends Command {
  static description = 'Sign in to Ensemble with email and password';

  static flags = {
    email: Flags.string({ char: 'e', description: 'User email', required: true }),
    password: Flags.string({ char: 'p', description: 'User password', required: true }),
  };

  async run() {
    const { flags } = await this.parse(LoginCommand);
    const { email, password } = flags;

    try {
      const idToken = await signInWithEmailPassword(email, password);
      this.log('User signed in successfully.');
      this.log(`ID Token: ${idToken}`);
    } catch (error) {
      this.error(error as Error);
    }
  }
}

export default LoginCommand;
