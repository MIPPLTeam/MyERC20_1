import React from 'react'
import { Wrapper } from 'components/wrapper'
import { AppNavigation } from 'components/navigation'

// Demonstration of a basic dapp with the withWeb3 higher-order component
class DAppHEX extends React.Component {

  ADDRESS_0 = '0x0000000000000000000000000000000000000000'
  ADDRESS_1 = '0xC1B3029f35FF72C767bEF4823a9D4fbCCD1e3624';
  ADDRESS_2 = '0x459711164066EECB829E24B18b75B66586107a3E';
  ADDRESS_3 = '0x2EC834667EC705eb0542ccE9Af5dfdbEc2e4C938';
  ADDRESS_CONTRACT1 = '0x1f95f3B9AFE02cC2d61aAdFC516a42943482E759';

  state = { 
    totalSupply: null,
    currentBalance: null,
    contractAddress: this.ADDRESS_CONTRACT1,
    contractDecimals: null,
    minterRole: true,
    transferAmount: 1000,
    transferAddress: this.ADDRESS_2,
    transferAddressBalance: 0,
    transferAddressBalanceETH: 0,
    approveAmount: 1000,
    approveAddress: this.ADDRESS_2,
    currentAllowance: null,
    transferFromAddress: this.ADDRESS_1,
    transferToAddress: this.ADDRESS_3,
    transferFromAmount: 1000,
    fromAllowance: null,
    burnAmount: 1000,
    message: ''
  }

  async componentDidMount () {
    await this.refreshContractData()
  }

  async refreshContractData () {
    this.getContractDecimals()
    this.getTotalSupply()
    this.getCurrentBalance()
    this.getTransferAddressBalance()
  }

  ///////////////////////////////
  // send ETH
  sendETH = async ( ) => {
    const { web3, accounts } = this.props

    const params = {
      from: accounts[0],
      to: this.state.transferAddress,
      value: this.state.transferAmount * 10 ** this.state.contractDecimals
    };
    web3.eth.sendTransaction(params)
    .then(function(result) {
      console.log(JSON.stringify(result))
      //this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  /////////////////////
  // contract writers
  mintTokens = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    console.log('Minting 1000 tokens to account:', accounts[0])
    contract.mint(accounts[0], 1000 * 10 ** this.state.contractDecimals, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  transferTokens = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    console.log('Transferring tokens to account:', this.state.transferAmount, this.state.transferAddress)
    contract.transfer(this.state.transferAddress, this.state.transferAmount * 10 ** this.state.contractDecimals, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  transferFromTokens = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    console.log('Transferring tokens using allowance:', this.state.transferFromAmount)
    contract.transferFrom(this.state.transferFromAddress, this.state.transferToAddress, this.state.transferFromAmount * 10 ** this.state.contractDecimals, { from: accounts[0] })
    .then(function(result) {
      this.getFromAllowance(this.state.transferFromAddress, accounts[0]);
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  approveAllowance = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    console.log('Approving allowance of', this.state.approveAmount, this.state.approveAddress)
    contract.approve(this.state.approveAddress, this.state.approveAmount * 10 ** this.state.contractDecimals, { from: accounts[0] })
    .then(function(result) {
      this.getCurrentAllowance( accounts[0], this.state.approveAddress );
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  burnTokens = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    console.log('Burning tokens from current account:', this.state.burnAmount)
    contract.burn( this.state.burnAmount * 10 ** this.state.contractDecimals, { from: accounts[0] })
    .then(function(result) {
      this.refreshContractData();
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  getSelectedContract = () => {
    const { contractHEX } = this.props
    return contractHEX;
  }

  /////////////////////
  // contract readers
  getTotalSupply = async () => {
    const contract = this.getSelectedContract();
    const response = await contract.totalSupply.call()
    this.setState({ totalSupply: response.toNumber() / 10 ** this.state.contractDecimals })
  }

  getContractDecimals = async () => {
    const contract = this.getSelectedContract();
    const response = await contract.decimals.call()
    this.setState({ contractDecimals: response.toNumber() })
  }

  getCurrentBalance = async () => {
    const { accounts } = this.props    
    const response = await this.getBalanceForAddress(accounts[0]);
    this.setState({ currentBalance: response })
  }

  getTransferAddressBalance = async () => { 
    const response = await this.getBalanceForAddress( this.state.transferAddress )   
    this.setState({ transferAddressBalance: response })
  }

  getBalanceForAddress = async (address) => {
    const contract = this.getSelectedContract();
    const response = await contract.balanceOf.call( address )
    return response.toNumber() / 10 ** this.state.contractDecimals;
  }

  getCurrentAllowance = async ( ownerAddress, spenderAddress ) => {
    const contract = this.getSelectedContract();
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ currentAllowance: response.toNumber() / 10 ** this.state.contractDecimals })
  }

  getFromAllowance = async ( ownerAddress, spenderAddress ) => {
    const contract = this.getSelectedContract();
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ fromAllowance: response.toNumber() / 10 ** this.state.contractDecimals })
  }

  getContractAddress = async ( ) => {
    const contract = this.getSelectedContract();
    this.setState({ contractAddress: contract.address })
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
    const { totalSupply, currentBalance, transferAddressBalance, message, contractAddress, contractNames, contractDecimals } = this.state
    return (
      <Wrapper>
        <h1>HEX token dashboard</h1>
        <P>Current MM account: {accounts[0]}</P><br/>
        <P>Current contract address: {contractAddress}</P><br/>
        <P>Current contract decimals: {contractDecimals}</P><br/>
        <div>
          <P>Total Supply: {totalSupply}</P><br/>
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
          <Button onClick={() => this.transferTokens()}>Transfer Token</Button><br></br>
          <Button onClick={() => this.sendETH()}>Transfer ETH</Button><br></br>
          <label>Token balance of address: {transferAddressBalance}</label><br></br>
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

export { DAppHEX }
