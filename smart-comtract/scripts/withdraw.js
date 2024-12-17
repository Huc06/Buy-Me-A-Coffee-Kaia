const hre = require("hardhat");

// contract address of BMC Contract
const buyMeACoffeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// address of the contract deployer
// useful when calling the withdrawCoffeTips() function
// ensure that this address is the SAME address as the original contract deployer
const deployerAddress = "0xFE0eD87d5A9c960469DEbf019f8BADe5d64f56CC";
// get the balance of a specified address
async function getBalance(address) {
    const balanceBigInt = await hre.ethers.provider.getBalance(address);
    return hre.ethers.utils.formatEther(balanceBigInt)
}

async function main() {
  
  // initialize the deployerAddress to a signer object
  // this will be useful when calling the withdrawCoffeTips() to the owner address
  const signer = await hre.ethers.getSigner(deployerAddress);

  // instantiate the BMC contract
  const BuyMeACoffee = await hre.ethers.getContractAt("BuyMeACoffee", buyMeACoffeAddress, signer);

  const balanceBefore = await getBalance(signer.address);
  const contractBalance = await getBalance(BuyMeACoffee.address);
  console.log(`Owner balance before withdrawing tips: ${balanceBefore} KAIA`);
  console.log(`Contract balance before withdrawing tips:  ${contractBalance} KAIA`);

    // Withdraw funds if there are funds to withdraw.
    if (contractBalance !== "0.0") {
        console.log("withdrawing funds..")
        const withdrawCoffeTxn = await BuyMeACoffee.withdrawCoffeTips();
        await withdrawCoffeTxn.wait();
        // check owner's balance after withdrawing coffee tips
        const balanceAfter = await getBalance(signer.address);
        console.log(`Owner balance after withdrawing tips ${balanceAfter} KAIA`);
      } else {
        console.log("no funds to withdraw!");
      }
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
