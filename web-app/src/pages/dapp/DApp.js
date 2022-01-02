import React from 'react'
import { Wrapper } from 'components/wrapper'
import { AppNavigation } from 'components/navigation'

// Demonstration of a basic dapp with the withWeb3 higher-order component
class DApp extends React.Component {
  state = { 
    totalSupply: null,
    currentBalance: null,
    message: ''
  }

  async componentDidMount () {
    await this.refreshContractData()

  }

  async refreshContractData () {
    console.log('Refresh account data')
    this.getTotalSupply()
    this.getCurrentBalance()
  }

  mintTokens = async () => {
    const { accounts, contract } = this.props

    console.log('Minting 1000 tokens to account:', accounts[0])
    contract.mint(accounts[0], 1000 * 1e18, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));

    await this.getTotalSupply()
  }

  getTotalSupply = async () => {
    const { contract } = this.props
    const response = await contract.totalSupply.call()
    this.setState({ totalSupply: response.toNumber() / 1e18 })
  }

  getCurrentBalance = async () => {
    const { accounts, contract } = this.props
    const response = await contract.balanceOf.call( accounts[0] )
    this.setState({ currentBalance: response.toNumber() / 1e18 })
  }

  render () {
    // Uncomment to use web3, accounts or the contract:
    const { web3, accounts, contract } = this.props
    const { totalSupply, currentBalance, message } = this.state
    return (
      <Wrapper>
        <h1>My ERC20 contract</h1>
        <P>Current MM account: {accounts[0]}</P>
        <div>
          <P>Total Supply: {totalSupply}</P>
          <Button leftMargin onClick={() => this.refreshContractData()}>Refresh...</Button>
        </div>
        <div>
          <P>Address balance: {currentBalance}</P>
        </div>
        <Button onClick={this.mintTokens}>Mint 1000 tokens to current MM account (if it has the permission)</Button>
        
        {this.state.message!='' && <div>
          <P>Message: {message}</P>
        </div>}
        <AppNavigation location={this.props.location} />
      </Wrapper>
    )
  }
}

const P = ({ children }) =>
  <p style={{ display: 'inline-block', marginBottom: '20px' }}>{ children }</p>

const Button = ({ children, leftMargin, ...rest }) => (
  leftMargin
    ? <button style={{ marginLeft: '20px' }} {...rest}>{ children }</button>
    : <button {...rest}>{ children }</button>
)

export { DApp }
