import { Command, Flags } from '@oclif/core';
import axios, { AxiosError } from 'axios';
import { get } from "lodash-es"

import { WEB_API_KEY , getStoredToken, signInWithEmailPassword, storeTokenFile } from '../utils.js';

class UpdatePasswordCommand extends Command {
  static description = 'Update a user\'s password in Ensemble';

  static flags = {
    email: Flags.string({ char: 'e', description: 'Old password', required: true }),
    newPassword: Flags.string({ char: 'n', description: 'New password', required: true }),
    oldPassword: Flags.string({ char: 'o', description: 'Old password', required: true }),
  };

  async run() {
    const { flags } = await this.parse(UpdatePasswordCommand);
    const { email, newPassword, oldPassword } = flags;

    try {
      let idToken: string | undefined = get(getStoredToken(), 'auth');
      if (!idToken) {
        idToken = await signInWithEmailPassword(email, oldPassword);
      }

      // Step 2: Use the ID token to update the password
      const updatePasswordUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${WEB_API_KEY}`;
      const updateResponse = await axios.post(updatePasswordUrl, {
        idToken,
        password: newPassword,
        returnSecureToken: true,
      });

      this.log('Password updated successfully!');
      this.log(`New ID Token: ${updateResponse.data.idToken}`);
      storeTokenFile(updateResponse);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.error(`Error updating password: ${get(axiosError.response?.data, "error.message") || get(error, "message")}`);
    }
  }
}

export default UpdatePasswordCommand;
