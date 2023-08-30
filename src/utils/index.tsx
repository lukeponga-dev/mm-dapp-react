export const formatBalance = (balance: string) => {
  const value = (parseInt(balance)  / 1000000000000000000).toFixed(2)
  return value +' ETH' 
 // return `${value.toFixed(2)} ETH`;
};

export const formatChainId = (chainId: string) => {
  const chainIdNum = parseInt(chainId)
    return chainIdNum;
};
