import type { CodeDataType } from "@/types/core";

export const formatSourceCode = (codeData: CodeDataType | undefined) => {
    if (!codeData || !codeData.sourceCode) {
        return undefined;
    }

    const data = [];
    let language;
    if (codeData.sourceCode.startsWith("{{")) {
        // multifile code
        const code = JSON.parse(codeData.sourceCode.slice(1, -1));
        language = code.language;
        const filePaths = Object.keys(code.sources);
        for (const filePath of filePaths) {
            const content = code.sources[filePath].content;
            data.push({
                fileName: filePath,
                content: content,
            });
        }
    } else {
        // single file code
        data.push({
            fileName: `${codeData.contractName}.sol`, // find a way to get the contract language as it can be in other languages other than solidity
            content: codeData.sourceCode,
        });

        language = "solidity";
    }

    return { language, sourceCode: data };
};
