import { Web3Provider } from "@ethersproject/providers";
import { SDKState } from "@metamask/sdk-react";

const useProvider = (provider: SDKState["provider"]): Web3Provider | null => {
    if (!provider) return null;
    return new Web3Provider(provider as any);
};

export default useProvider;
