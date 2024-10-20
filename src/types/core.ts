export type CodeDataType = {
    address: string;
    isVerified: boolean;
    contractName?: string;
    sourceCode?: string;
    bytecode?: string;
    ABI?: string;
    startBlock?: string;
    deployer?: string;
    compilerVersion?: string;
    optimizationUsed?: string;
    runs?: string;
};
