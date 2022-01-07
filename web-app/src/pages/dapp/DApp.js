import React from 'react'
import { Wrapper } from 'components/wrapper'
import { AppNavigation } from 'components/navigation'

// Demonstration of a basic dapp with the withWeb3 higher-order component
class DApp extends React.Component {

  ADDRESS_0 = '0x0000000000000000000000000000000000000000'
  ADDRESS_1 = '0xC1B3029f35FF72C767bEF4823a9D4fbCCD1e3624';
  ADDRESS_2 = '0x459711164066EECB829E24B18b75B66586107a3E';
  ADDRESS_3 = '0x2EC834667EC705eb0542ccE9Af5dfdbEc2e4C938';
  ADDRESS_CONTRACT1 = '0x24fC4df5b014050E44D02e9829f1B6b8500215fa';
  ADDRESS_CONTRACT2 = '0xae35686557408dde10512AB591163d2509B897Fd';

  state = { 
    totalSupply: null,
    currentBalance: null,
    selectedContract: 0,
    contractNames: [],
    contractAddress: this.ADDRESS_CONTRACT1,
    adminRole: null,
    minterRole: null,
    pauserRole: null,
    transferAmount: 1000,
    transferAddress: this.ADDRESS_CONTRACT2,
    transferAddressBalance: 0,
    transferAddressBalanceETH: 0,
    approveAmount: 1000,
    approveAddress: this.ADDRESS_2,
    currentAllowance: null,
    transferFromAddress: this.ADDRESS_1,
    transferToAddress: this.ADDRESS_3,
    transferFromAmount: 1000,
    fromAllowance: null,
    roleAddress: this.ADDRESS_2,
    burnAmount: 1000,
    snapshotId: 1,
    snapshotAddress: this.ADDRESS_2,
    snapshotRole: null,
    snapshotBalance: null,
    message: ''
  }

  async componentDidMount () {
    await this.refreshContractData()
  }

  async refreshContractData () {
    this.getContractNames()
    this.getTotalSupply()
    this.getCurrentBalance()
    this.getTransferAddressBalance()
    this.hasAdminRole()
    this.hasMinterRole()
    this.hasPauserRole()
    this.hasSnapshotRole()
  }

  ///////////////////////////////
  // send ETH
  sendETH = async ( ) => {
    const { web3, accounts } = this.props

    const params = {
      from: accounts[0],
      to: this.state.transferAddress,
      value: this.state.transferAmount * 1e18
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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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
    const { accounts } = this.props
    const contract = this.getSelectedContract();

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

  takeSnapshot = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();

    contract.snapshot( { from: accounts[0] })
    .then(function(result) {
      var id = result.logs[0].args.id.toNumber();
      console.log('Taking snapshot of current balances: ' + JSON.stringify(id))
      this.setState({snapshotId: id});
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  refundToken = async () => {
    const { accounts, contracts } = this.props
    const contract = contracts[1];  // only refundable contract

    contract.refundToken( this.state.contractAddress, accounts[0], this.state.transferAmount * 1e18, { from: accounts[0] })
    .then(function(result) {
      console.log('Refunding: ' + JSON.stringify(result))
    }.bind(this))
    .catch(function(err) {
      console.log(err.message);
      this.setState({message: err.message});
    }.bind(this));
  }

  getSelectedContract = () => {
    const { contracts } = this.props
    return contracts[this.state.selectedContract]
  }

  /////////////////////
  // contract readers
  getContractNames = async () => {
    const { contracts } = this.props
    var contractNames = []

    contracts.forEach(async c => {
      const symbol = await c.symbol.call()  
      const name = await c.name.call()    
      contractNames.push({symbol, name})
    }); 
    this.setState({ contractNames })
  }

  getTotalSupply = async () => {
    const contract = this.getSelectedContract();
    const response = await contract.totalSupply.call()
    this.setState({ totalSupply: response.toNumber() / 1e18 })
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
    return response.toNumber() / 1e18;
  }

  getCurrentAllowance = async ( ownerAddress, spenderAddress ) => {
    const contract = this.getSelectedContract();
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ currentAllowance: response.toNumber() / 1e18 })
  }

  getFromAllowance = async ( ownerAddress, spenderAddress ) => {
    const contract = this.getSelectedContract();
    const response = await contract.allowance.call( ownerAddress, spenderAddress )
    this.setState({ fromAllowance: response.toNumber() / 1e18 })
  }

  getSnapshotBalance = async ( ) => {
    const contract = this.getSelectedContract();
    const response = await contract.balanceOfAt.call( this.state.snapshotAddress, this.state.snapshotId );
    this.setState({ snapshotBalance: response.toNumber() / 1e18 })
  }

  getContractAddress = async ( ) => {
    const contract = this.getSelectedContract();
    this.setState({ contractAddress: contract.address })
  }


  ///////////////////////////////////
  // contract Access Control writers
  grantMinter = async () => {
    const contract = this.getSelectedContract();
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    await this.grantRole( MINTER_ROLE );  
  }

  revokeMinter = async () => {
    const contract = this.getSelectedContract();
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    await this.revokeRole( MINTER_ROLE );  
  }

  grantPauser = async () => {
    const contract = this.getSelectedContract();
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    await this.grantRole( PAUSER_ROLE );  
  }

  revokePauser = async () => {
    const contract = this.getSelectedContract();
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    await this.revokeRole( PAUSER_ROLE );  
  }

  grantSnapshot = async () => {
    const contract = this.getSelectedContract();
    let SNAPSHOT_ROLE = await contract.SNAPSHOT_ROLE.call()
    await this.grantRole( SNAPSHOT_ROLE );  
  }

  revokeSnapshot = async () => {
    const contract = this.getSelectedContract();
    let SNAPSHOT_ROLE = await contract.SNAPSHOT_ROLE.call()
    await this.revokeRole( SNAPSHOT_ROLE );  
  }

  grantRole = async (role) => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();
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
    const { accounts } = this.props
    const contract = this.getSelectedContract();
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
    const { accounts } = this.props
    const contract = this.getSelectedContract();
    let ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE.call()
    const response = await contract.hasRole.call( ADMIN_ROLE, accounts[0] )  
    this.setState({ adminRole: response })
  }

  hasMinterRole = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();
    let MINTER_ROLE = await contract.MINTER_ROLE.call()
    const response = await contract.hasRole.call( MINTER_ROLE, accounts[0] )  
    this.setState({ minterRole: response })
  }

  hasPauserRole = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();
    let PAUSER_ROLE = await contract.PAUSER_ROLE.call()
    const response = await contract.hasRole.call( PAUSER_ROLE, accounts[0] )  
    this.setState({ pauserRole: response })
  }

  hasSnapshotRole = async () => {
    const { accounts } = this.props
    const contract = this.getSelectedContract();
    let SNAPSHOT_ROLE = await contract.SNAPSHOT_ROLE.call()
    const response = await contract.hasRole.call( SNAPSHOT_ROLE, accounts[0] )  
    this.setState({ snapshotRole: response })
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

  handleSnapshotAddressChange = (event) => {
    this.setState({snapshotAddress: event.target.value});
  }

  handleSnapshotIdChange = (event) => {
    if (this.validateNumber(event)) {
      this.setState({snapshotId: event.target.value});
    }
  }

  handleContractChange = (event) => {
    if (event.target.value!==this.state.selectedContract)  {
      this.setState({selectedContract: event.target.value}, () => {
        const contract = this.getSelectedContract();
        this.setState({ contractAddress: contract.address }, () => {
          this.refreshContractData();  
        })
      });
    }
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
    const { totalSupply, currentBalance, transferAddressBalance, message, contractAddress, contractNames } = this.state
    return (
      <Wrapper>
        <h1>My ERC20 contract</h1>
        <P>Current MM account: {accounts[0]}</P><br/>
        <P>Current contract address: {contractAddress}</P><br/>
        <select value={this.state.selectedContract} onChange={this.handleContractChange}>
        {contractNames.map( (item, index) => {
            return (<option key={index} value={index}>{item.name + ' (' + item.symbol + ')'}</option>);
        })}
      </select>
        <div>
          <P>Total Supply 1: {totalSupply}</P><br/>
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
          <Button onClick={() => this.refundToken()}>Refund token trapped in Contract ME2</Button><br></br>
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

        {this.state.snapshotRole && <Wrapper>
          <Button onClick={this.takeSnapshot}>Take balance snapshot</Button>
          <label>Last snapshot id: </label>
          <input type="text" value={this.state.snapshotId} onChange={this.handleSnapshotIdChange} />
        </Wrapper>}
        {this.state.snapshotRole && <Wrapper>
          <input type="text" value={this.state.snapshotAddress} onChange={this.handleSnapshotAddressChange} />
          <Button onClick={this.getSnapshotBalance}>Recover balance snapshot</Button>
          <label>Snapshot balance for account is: {this.state.snapshotBalance}</label>
        </Wrapper>}
        {!this.state.snapshotRole && <Wrapper>
          <P>You don´t have snapshot role!</P>
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
          <P>
            <Button onClick={this.grantSnapshot}>Grant snapshot role</Button>
            <Button onClick={this.revokeSnapshot}>Revoke snapshot role</Button>
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
