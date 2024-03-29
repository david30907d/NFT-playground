require('dotenv').config();
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/PyConTwNFT.sol/PyConTwNFT.json");
const contractAddress = "0x803770ABc665e18eeEb50E9DBe3D65138Bc6dd45";
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function changeURIofNFT(tokenURI) {
    let events = await nftContract.getPastEvents('NftEvent', {
        fromBlock: 0,
        toBlock: 'latest'
    })
    const pastTokenId = events[0].returnValues.tokenId;

    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest") //get latest nonce
  
    //the transaction
    const tx = {
      from: PUBLIC_KEY,
      to: contractAddress,
      nonce: nonce,
      gas: 500000,
      data: nftContract.methods.setTokenUri(pastTokenId, tokenURI).encodeABI(),
    }
  
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
    signPromise
      .then((signedTx) => {
        web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (err, hash) {
            if (!err) {
              console.log(
                "The hash of your transaction is: ",
                hash,
                "\nCheck Alchemy's Mempool to view the status of your transaction!"
              )
            } else {
              console.log(
                "Something went wrong when submitting your transaction:",
                err
              )
            }
          }
        )
      })
      .catch((err) => {
        console.log(" Promise failed:", err)
      })

}


changeURIofNFT("ipfs://QmeCnxbZK64ZYiF4RpvnFaZux9Z6bqh7CFT8juAT1dN9mg")