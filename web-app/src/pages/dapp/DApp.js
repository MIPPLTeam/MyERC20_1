import React from 'react'
import { Wrapper } from 'components/wrapper'
import { AppNavigation } from 'components/navigation'

// Demonstration of a basic dapp with the withWeb3 higher-order component
class DApp extends React.Component {
  state = { 
    totalSupply: null,
    currentBalance: null,
    minterRole: null,
    transferAmount: 1000,
    transferAddress: '0x459711164066EECB829E24B18b75B66586107a3E',
    message: ''
  }

  constructor(props) {
    super(props);
   
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
  }

  async componentDidMount () {
    await this.refreshContractData()
  }

  async refreshContractData () {
    console.log('Refresh account data')
    this.getTotalSupply()
    this.getCurrentBalance()
    this.hasMinterRole()
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
  }

  transferTokens = async () => {
    const { accounts, contract } = this.props

    console.log('Transferring tokens to account:', this.state.transferAmount, this.state.transferAddress)
    contract.transfer(this.state.transferAddress, this.state.transferAmount * 1e18, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
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

  hasMinterRole = async () => {
    const { accounts, contract } = this.props
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    const response = await contract.hasRole.call( MINTER_ROLE, accounts[0] )  
    this.setState({ minterRole: response })
  }

  handleAmountChange(event) {
    this.setState({transferAmount: event.target.value});
  }

  handleAddressChange(event) {
    this.setState({transferAddress: event.target.value});
  }

  render () {
    // Uncomment to use web3, accounts or the contract:
    //const { web3, accounts, contract } = this.props
    const { accounts } = this.props
    const { totalSupply, currentBalance, minterRole, message } = this.state
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
        <Wrapper>
          <label>Transfer </label>
          <input type="text" value={this.state.transferAmount} onChange={this.handleAmountChange} />
          <label> to: </label>
          <input type="text" value={this.state.transferAddress} onChange={this.handleAddressChange} />
          <Button onClick={() => this.transferTokens()}>Transfer</Button>
        </Wrapper>
        
        {this.state.minterRole && <div>
          <Button onClick={this.mintTokens}>Mint 1000 tokens to current MM account</Button>
        </div>}
        {!this.state.minterRole && <div>
          <P>You don´t have minter role!</P>
        </div>}
        <div>
          <P>MINTER Role: {minterRole?'True':'False'}</P>
        </div>
        {this.state.message!=='' && <div>
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
