import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('apps:list', () => {
  it('runs apps:list cmd', async () => {
    const {stdout} = await runCommand('apps:list')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:list --name oclif', async () => {
    const {stdout} = await runCommand('apps:list --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
