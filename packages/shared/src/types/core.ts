export type CodeDataType = {
    networkId: number;
    address: string;
    isVerified: boolean;
    contractName?: string;
    sourceCode?: string;
    bytecode?: string;
    ABI?: string;
    ABIConfidenceScores?: { [key: string]: number };
    startBlock?: number;
    deployer?: string;
    compilerVersion?: string;
    optimizationUsed?: string;
    runs?: string;
};
