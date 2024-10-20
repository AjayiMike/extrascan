import { getBytecode } from "@/utils/bytecode";
import { loadCodeFromEtherscan } from "@/utils/code ";
import { getContractCreationInfo } from "@/utils/contractCreationBlock";

export async function POST(request: Request) {
    try {
        const { networkId, address } = await request.json();
        const contractCodeData = await loadCodeFromEtherscan(networkId, address);
        if (contractCodeData.error) return new Response(JSON.stringify(contractCodeData.error), { status: 200 });
        const bytecode = await getBytecode(networkId, address);
        const { blockNumber, deployer } = await getContractCreationInfo(networkId, address);
        return new Response(JSON.stringify({ ...contractCodeData.data, bytecode, startBlock: blockNumber, deployer }), {
            status: 200,
        });
    } catch (error) {
        console.error("an error occured: ", error);
        return new Response(JSON.stringify({ error }), { status: 500 });
    }
}
