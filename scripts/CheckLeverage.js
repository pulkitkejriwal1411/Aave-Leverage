const axios = require('axios')


const LendingPoolAbi = require('../LendingPoolABI.json');
const LendingPoolAddress = '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf';
const LendingPoolcontract = new web3.eth.Contract(LendingPoolAbi, LendingPoolAddress);


let addressArray = [];//add users here 

let depositCount = new Map();

let transactionHash = new Map();

let answer= [];

async function getDeposits(fromBlock,toBlock){
    await LendingPoolcontract.getPastEvents('Deposit',{
        filter: {onBehalfOf: addressArray},
        fromBlock: fromBlock,
        toBlock: toBlock,
    },(err,events)=>{
        for(let x=0;x<events.length;x++)
        {
            let fromAddress = events[x].returnValues.user;
            if(depositCount.has(fromAddress))
            {
                let dc = depositCount.get(fromAddress);
                dc +=1;
                depositCount.delete(fromAddress);
                depositCount.set(fromAddress,dc);
            }
            else
            {
                depositCount.set(fromAddress,1);
            }
            transactionHash.set(events[x].transactionHash,1);
        }
    });
    await LendingPoolcontract.getPastEvents('Borrow',{
        filter: {onBehalfOf: addressArray},
        fromBlock: fromBlock,
        toBlock: toBlock
    },(err,events)=>{
        for(let x=0;x<events.length;x++)
        {   
            let fromAddress = events[x].returnValues.onBehalfOf;
            
            if(transactionHash.has(events[x].transactionHash))//checking if user has deposited in the same transaction hash
            {
                if(depositCount.get(fromAddress)>=2)
                answer.push(fromAddress);
            }
            
        }
    });
}


async function getAccounts(){
    const result = await axios.post(
        'https://api.thegraph.com/subgraphs/name/thrilok209/instadapp-uniswap-v3',
        {
            query: `{
                positions(first: 1000) {
                  owner
                }
            }`
        }
    );
    let res = result.data.data.positions
    for(let i=0;i<res.length;i++)
    {
        addressArray.push(res[i].owner);
    }
}


async function calculate(){
    
    getAccounts();
    const latestBlock = await web3.eth.getBlockNumber();
    let fromBlock = 24664156;//change the block limit here
    let toBlock = latestBlock;

    //looping over million  blocks at a time

    for(let i=fromBlock;i<toBlock;i+=1000001)
    {
        console.log(i);
        await getDeposits(i,i+1000000);
    }
    
 
   
    
    console.log(answer);
}

calculate();
