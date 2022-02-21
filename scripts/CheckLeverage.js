
const LendingPoolAbi = require('../LendingPoolABI.json');
const LendingPoolAddress = '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf';
const LendingPoolcontract = new web3.eth.Contract(LendingPoolAbi, LendingPoolAddress);


let addressArray = ['0xc552f6c8efab61c293a16a79a4bbbab24a56dbee'];//add users here 

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


async function calculate(){
    
     
    const latestBlock = await web3.eth.getBlockNumber();
    let fromBlock = 25185670;//change the block limit here
    let toBlock = 25185771;

    //looping over hundred blocks at a time

    for(let i=fromBlock;i<toBlock;i+=101)
    {
        await getDeposits(i,i+100);
    }
    
 
   
    
    console.log(answer);
}

calculate();