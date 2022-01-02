const MyERP20_1 = artifacts.require('./web-app/src/contracts/MyERC20_1.sol')

module.exports = function (deployer) {
  deployer.deploy(MyERP20_1)
}
