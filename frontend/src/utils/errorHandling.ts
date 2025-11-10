export const getErrorMessage = (error: any): string => {
  if (error.code === 'BAD_DATA') {
    return 'Contract not deployed or wrong network. Please ensure Hardhat node is running and contracts are deployed.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Cannot connect to network. Please ensure Hardhat node is running on http://127.0.0.1:8545';
  }
  
  if (error.code === 'CALL_EXCEPTION') {
    return 'Contract call failed. The contract may not be deployed at this address.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};
