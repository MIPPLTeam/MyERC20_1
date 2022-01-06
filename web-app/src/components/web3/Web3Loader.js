import React from 'react'
import { getWeb3, getAccounts, getContractInstance, getContractInstance2 } from 'services/web3'

export class Web3Loader extends React.Component {
  state = { web3: null, accounts: null, contract: null, contracts: [] }

  async componentDidMount () {
    try {
      const web3 = await getWeb3()
      const accounts = await getAccounts(web3)
      var contracts = []
      const contract = await getContractInstance(web3)
      contracts.push(contract)
      const contract2 = await getContractInstance2(web3)
      contracts.push(contract2)
      this.setState({ web3, accounts, contract, contracts })
    } catch (error) {
      alert(`Failed to load web3, accounts, and contracts. Check console for details.`)
      console.log(error)
    }
  }

  render () {
    return this.props.render(this.state)
  }
}
