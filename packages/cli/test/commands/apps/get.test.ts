import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe.skip('apps:get', () => {
  it('runs apps:get cmd', async () => {
    const {stdout} = await runCommand('apps:get')
    expect(stdout).to.contain('hello world')
  })

  it('runs apps:get --name oclif', async () => {
    const {stdout} = await runCommand('apps:get --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
