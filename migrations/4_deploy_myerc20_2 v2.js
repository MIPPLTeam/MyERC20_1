const MyERC20_2 = artifacts.require('./web-app/src/contracts/MyERC20_2.sol')

module.exports = function (deployer) {
  deployer.deploy(MyERC20_2)
}
