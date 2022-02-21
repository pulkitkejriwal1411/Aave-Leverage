
const LendingPoolAbi = require('../LendingPoolABI.json');
const LendingPoolAddress = '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf';
const LendingPoolcontract = new web3.eth.Contract(LendingPoolAbi, LendingPoolAddress);


let addressArray = ['0x45DC4ffA81419CBCC30fCA7BBD4E619E21ad2043'];//add users here 
let accountMap = new Map();
let transaction = new Map();

let transactionHash = new Map();



async function getDeposits(fromBlock,toBlock){
    await LendingPoolcontract.getPastEvents('Deposit',{
        fromBlock: fromBlock,
        toBlock: toBlock,
    },(err,events)=>{
        
        for(let x=0;x<events.length;x++)
        {
            let fromAddress = events[x].returnValues.user;
            if(accountMap.has(fromAddress))
            {
                let logIndex = events[x].logIndex;
                let blockNumber = events[x].blockNumber;
                let Num = Number(blockNumber + '.' + logIndex);
                transaction[fromAddress].push([Num,1]);
                transactionHash.set([events[x].transactionHash],1);
            }
        }
    });
    await LendingPoolcontract.getPastEvents('Borrow',{
        fromBlock: fromBlock,
        toBlock: toBlock
    },(err,events)=>{
        for(let x=0;x<events.length;x++)
        {   
            let fromAddress = events[x].returnValues.user;
            if(accountMap.has(fromAddress))
            {
                if(transactionHash.has(events[x].transactionHash))//checking if user has deposited in the same transaction hash
                {
                    let logIndex = events[x].logIndex;
                    let blockNumber = events[x].blockNumber;
                    let Num = Number(blockNumber + '.' + logIndex);
                    transaction[fromAddress].push([Num,0]);
                }
            }
        }
    });
}


async function calculate(){
    for(let i=0;i<addressArray.length;i++)
    {
        accountMap.set(addressArray[i],1);
        transaction[addressArray[i]] = [];
    }
    const latestBlock = await web3.eth.getBlockNumber();
    let fromBlock = 25188864;//change the block limit here
    let toBlock = 25188865;

    //looping over hundred blocks at a time

    for(let i=fromBlock;i<toBlock;i+=101)
    {
        await getDeposits(i,i+100);
    }
    let answer= [];
 
   
    //looping over address array to find if this address has had a lending position
    for(let i=0;i<addressArray.length;i++)
    {
        let depositArr = transaction[addressArray[i]];
        depositArr = depositArr.sort(function(a,b){
            if(a[0]<b[0])
            return 1;
            return -1;
        })
        let c=0;
        for(let i=0;i<depositArr.length;i++)
        {
            if(depositArr[i][1]===0)
            {
                c=1;
            }
            if(depositArr[i][1]===1 && c===1)
            {
                answer.push(addressArray[i]);
                break;
            }
        }
    }
    console.log(answer);
}

calculate();