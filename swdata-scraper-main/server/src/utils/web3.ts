import { ethers } from "ethers";

const network = "homestead";

const ethereumProvider = ethers.getDefaultProvider(network, {
  etherscan: process.env.ETHERSCAN_API_KEY,
  infura: {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  },
  alchemy: process.env.ALCHEMY_API_KEY,
});

const polygonProvider = new ethers.providers.JsonRpcProvider(
  process.env.POLYGON_RPC || "https://polygon-rpc.com"
);

export { ethereumProvider, polygonProvider };
