import Web3 from "web3";

// Connect to Ganache (Local Ethereum Node)
const web3 = new Web3("http://127.0.0.1:7545"); // Replace with your Ganache RPC URL

const contractAddress = "0x01DeCddab8d6e8fAcc517d407bd0c5B081B1357f";
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "registerCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
    ],
    name: "getCertificate",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
];

// Create and export the getBlockchain function
export const getBlockchain = async () => {
  try {
    // You can get accounts from Ganache, or use the account directly as needed
    const accounts = await web3.eth.getAccounts();

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    return { accounts, contract, web3 };
  } catch (error) {
    console.error("Error getting blockchain:", error);
  }
};
