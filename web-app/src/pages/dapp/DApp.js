import React from 'react'
import { Wrapper } from 'components/wrapper'
import { AppNavigation } from 'components/navigation'

// Demonstration of a basic dapp with the withWeb3 higher-order component
class DApp extends React.Component {

  ADDRESS_1 = '0xC1B3029f35FF72C767bEF4823a9D4fbCCD1e3624';
  ADDRESS_2 = '0x459711164066EECB829E24B18b75B66586107a3E';
  ADDRESS_3 = '0x2EC834667EC705eb0542ccE9Af5dfdbEc2e4C938';

  state = { 
    totalSupply: null,
    currentBalance: null,
    adminRole: null,
    minterRole: null,
    pauserRole: null,
    transferAmount: 1000,
    transferAddress: this.ADDRESS_2,
    approveAmount: 1000,
    approveAddress: this.ADDRESS_2,
    currentAllowance: null,
    transferFromAddress: this.ADDRESS_1,
    transferToAddress: this.ADDRESS_3,
    transferFromAmount: 1000,
    fromAllowance: null,
    roleAddress: this.ADDRESS_2,
    burnAmount: 1000,
    message: ''
  }

  async componentDidMount () {
    await this.refreshContractData()
  }

  async refreshContractData () {
    console.log('Refresh account data')
    this.getTotalSupply()
    this.getCurrentBalance()
    this.hasAdminRole()
    this.hasMinterRole()
    this.hasPauserRole()
  }

  /////////////////////
  // contract writers
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

  transferFromTokens = async () => {
    const { accounts, contract } = this.props

    console.log('Transferring tokens using allowance:', this.state.transferFromAmount)
    contract.transferFrom(this.state.transferFromAddress, this.state.transferToAddress, this.state.transferFromAmount * 1e18, { from: accounts[0] })
    .then(function(result) {
      this.getFromAllowance(this.state.transferFromAddress, accounts[0]);
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  approveAllowance = async () => {
    const { accounts, contract } = this.props

    console.log('Approving allowance of', this.state.approveAmount, this.state.approveAddress)
    contract.approve(this.state.approveAddress, this.state.approveAmount * 1e18, { from: accounts[0] })
    .then(function(result) {
      this.getCurrentAllowance( accounts[0], this.state.approveAddress );
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  burnTokens = async () => {
    const { accounts, contract } = this.props

    console.log('Burning tokens from current account:', this.state.burnAmount)
    contract.burn( this.state.burnAmount * 1e18, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  pauseToken = async () => {
    const { accounts, contract } = this.props

    console.log('Pausing token')
    contract.pause( { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  unpauseToken = async () => {
    const { accounts, contract } = this.props

    console.log('Pausing token')
    contract.unpause( { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  /////////////////////
  // contract readers
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

  getCurrentAllowance = async ( ownerAddress, spenderAddress ) => {
    const { contract } = this.props
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ currentAllowance: response.toNumber() / 1e18 })
  }

  getFromAllowance = async ( ownerAddress, spenderAddress ) => {
    const { contract } = this.props
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ fromAllowance: response.toNumber() / 1e18 })
  }

  ///////////////////////////////////
  // contract Access Control writers
  grantMinter = async () => {
    const { contract } = this.props
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    await this.grantRole( MINTER_ROLE );  
  }

  revokeMinter = async () => {
    const { contract } = this.props
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    await this.revokeRole( MINTER_ROLE );  
  }

  grantPauser = async () => {
    const { contract } = this.props
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    await this.grantRole( PAUSER_ROLE );  
  }

  revokePauser = async () => {
    const { contract } = this.props
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    await this.revokeRole( PAUSER_ROLE );  
  }

  grantRole = async (role) => {
    const { accounts, contract } = this.props
    console.log('Grant role to ', this.state.roleAddress)
    contract.grantRole( role, this.state.roleAddress,  { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  revokeRole = async (role) => {
    const { accounts, contract } = this.props
    console.log('Revoke role to ', this.state.roleAddress)
    contract.revokeRole( role, this.state.roleAddress,  { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  ///////////////////////////////////
  // contract Access Control readers
  hasAdminRole = async () => {
    const { accounts, contract } = this.props
    let ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE.call()
    const response = await contract.hasRole.call( ADMIN_ROLE, accounts[0] )  
    this.setState({ adminRole: response })
  }

  hasMinterRole = async () => {
    const { accounts, contract } = this.props
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    const response = await contract.hasRole.call( MINTER_ROLE, accounts[0] )  
    this.setState({ minterRole: response })
  }

  hasPauserRole = async () => {
    const { accounts, contract } = this.props
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    const response = await contract.hasRole.call( PAUSER_ROLE, accounts[0] )  
    this.setState({ pauserRole: response })
  }


  /////////////////////
  // input handlers
  handleAmountChange = (event) => {
    if (this.validateNumber(event)) {
      this.setState({transferAmount: event.target.value});
    }
  }

  handleAddressChange = (event) => {
    this.setState({transferAddress: event.target.value});
  }

  handleRoleAddressChange = (event) => {
    this.setState({roleAddress: event.target.value});
  }

  handleAmountBurn = (event) => {
    if (this.validateNumber(event)) {
      this.setState({burnAmount: event.target.value});
    }
  }

  handleAmountApprove = (event) => {
    if (this.validateNumber(event)) {
      this.setState({approveAmount: event.target.value});
    }
  }

  handleAddressApprove = (event) => {
    let address = event.target.value;
    this.setState({approveAddress: address});
  }

  handleAmountFromChange = (event) => {
    if (this.validateNumber(event)) {
      this.setState({transferFromAmount: event.target.value});
    }
  }

  handleAddressFromChange = (event) => {
    this.setState({transferFromAddress: event.target.value});
  }

  handleAddressToChange = (event) => {
    this.setState({transferToAddress: event.target.value});
  }

  validateNumber = (event) => {
    if (isNaN(event.target.value)) {
      this.setState({message: 'Amount must be a number'});
      return false;
    }    
    return true;
  }

  ////////////////////////
  // RENDER
  render () {
    // Uncomment to use web3, accounts or the contract:
    //const { web3, accounts, contract } = this.props
    const { accounts } = this.props
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
        <Wrapper>
          <label>Transfer amount:</label>
          <input type="text" value={this.state.transferAmount} onChange={this.handleAmountChange} />
          <label> to: </label>
          <input type="text" value={this.state.transferAddress} onChange={this.handleAddressChange} />
          <Button onClick={() => this.transferTokens()}>Transfer</Button>
        </Wrapper>
        
        <Wrapper>
          <label>Approve allowance </label>
          <input type="text" value={this.state.approveAmount} onChange={this.handleAmountApprove} />
          <label> to spender: </label>
          <input type="text" value={this.state.approveAddress} onChange={this.handleAddressApprove} />
          <Button onClick={() => this.approveAllowance()}>Approve</Button>
        </Wrapper>
        
        <Wrapper>
          <label>Current allowance: {this.state.currentAllowance} </label>
          <Button onClick={() => this.getCurrentAllowance( this.props.accounts[0], this.state.approveAddress)}>Refresh</Button>
        </Wrapper>

        <Wrapper>
          <label>Transfer From:</label>
          <input type="text" value={this.state.transferFromAddress} onChange={this.handleAddressFromChange} />
          <label> Amount:</label>
          <input type="text" value={this.state.transferFromAmount} onChange={this.handleAmountFromChange} />
          <label> to: </label>
          <input type="text" value={this.state.transferToAddress} onChange={this.handleAddressToChange} />
          <Button onClick={() => this.transferFromTokens()}>Transfer</Button>
        </Wrapper>
        <Wrapper>
          <label> Allowance from address {this.state.transferFromAddress}: {this.state.fromAllowance} </label>
          <Button onClick={() => this.getFromAllowance( this.state.transferFromAddress, this.props.accounts[0])}>Refresh</Button>
        </Wrapper>

        <Wrapper>
          <label>Burn tokens: </label>
          <input type="text" value={this.state.burnAmount} onChange={this.handleAmountBurn} />
          <Button onClick={() => this.burnTokens()}>Burn</Button>
        </Wrapper>
        
        {this.state.minterRole && <Wrapper>
          <Button onClick={this.mintTokens}>Mint 1000 tokens to current MM account</Button>
        </Wrapper>}
        {!this.state.minterRole && <Wrapper>
          <P>You don´t have minter role!</P>
        </Wrapper>}

        {this.state.pauserRole && <Wrapper>
          <Button onClick={this.pauseToken}>Pause Token</Button>
          <Button onClick={this.unpauseToken}>Unpause Token</Button>
        </Wrapper>}
        {!this.state.pauserRole && <Wrapper>
          <P>You don´t have pauser role!</P>
        </Wrapper>}

        {this.state.adminRole && <Wrapper>
          <input type="text" value={this.state.roleAddress} onChange={this.handleRoleAddressChange} />
          <P>
            <Button onClick={this.grantMinter}>Grant minter role</Button>
            <Button onClick={this.revokeMinter}>Revoke minter role</Button>
          </P>
          <P>
            <Button onClick={this.grantPauser}>Grant pauser role</Button>
            <Button onClick={this.revokePauser}>Revoke pauser role</Button>
          </P>
        </Wrapper>}
        {!this.state.adminRole && <Wrapper>
          <P>You don´t have Admin role!</P>
        </Wrapper>}

        {this.state.message!=='' && <Wrapper>
          <P>Message: {message}</P>
        </Wrapper>}

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
