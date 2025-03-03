export const parseEther = (value: string, decimals: number) => {
  return (BigInt(value) * BigInt(10 ** decimals)).toString();
};

export const formatEther = (value: string, decimals: number) => {
  return (BigInt(value) / BigInt(10 ** decimals)).toString();
};
