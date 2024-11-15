import { getCloudApps } from '@ensembleui/js-commons'
import {Command} from '@oclif/core'
import { jwtDecode } from "jwt-decode";
import { get } from 'lodash-es';

import { db } from '../../firebase.js'
import { getStoredToken, signInWithEmailPassword } from '../../utils.js'

export default class AppsList extends Command {
  static override description = 'List all apps you have access to'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const cachedAuth = getStoredToken();
    if (!cachedAuth) {
      this.error('Please login first.')
    }

    const { email, password } = cachedAuth;
    const token = await signInWithEmailPassword(email, password);

    const decodedToken = jwtDecode(token);

    const userId = get(decodedToken, 'userId');
    if (!userId) {
      this.error('Invalid token. Please try logging in again.')
    }
  
    const result = await getCloudApps(db, userId)
    const list = result.map((appData) => ({
        description: appData.description,
        id: appData.id,
        name: appData.name,
        role: appData.collaborators?.[`users_${userId}`]
      }));

    // TODO: tabulate results
    this.log(JSON.stringify(list, null, 2))
  }
}
