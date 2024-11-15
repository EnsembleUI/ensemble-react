import { getFirestoreApplicationTransporter, getLocalApplicationTransporter } from '@ensembleui/js-commons'
import {Args, Command, Flags} from '@oclif/core'
import { get } from 'lodash-es'

import { db } from '../../firebase.js'
import { getStoredToken, signInWithEmailPassword } from '../../utils.js'

export default class AppsGet extends Command {
  static override args = {
    id: Args.string({description: 'Ensemble App ID', required: true}),
  }

  static override description = 'Get a local copy of the app'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    dir: Flags.string({char: 'd', description: 'Where the app should be copied to'}),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AppsGet);
    const cachedAuth = getStoredToken();
    if (!cachedAuth) {
      this.error('Please login first.')
    }

    const { email, password } = cachedAuth;
    await signInWithEmailPassword(email, password);

    try {
    const firestoreAppTransporter = getFirestoreApplicationTransporter(db);
    const localAppTransporter = getLocalApplicationTransporter(this.config.dataDir);
    const app = await firestoreAppTransporter.get(args.id);
    await localAppTransporter.put(app, flags.dir ?? process.cwd());
    } catch (error) {
      this.error(get(error, "message") ?? "An error occurred")
    }

    this.log('Done!')
  }
}
