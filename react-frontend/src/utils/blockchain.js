import Web3 from "web3";

// Connect to Ganache (Local Ethereum Node)
const web3 = new Web3("http://127.0.0.1:7545"); // Replace with your Ganache RPC URL

const contractAddress = "0x720cb8707C40C78E3AdfC4553bde78094bE29a20";
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
  },
  {
    inputs: [],
    name: "getAllCertificates",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        internalType: "string",
        name: "newName",
        type: "string",
      },
      {
        internalType: "string",
        name: "newCid",
        type: "string",
      },
    ],
    name: "updateCertificate",
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
    name: "deleteCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Create and export the getBlockchain function
export const getBlockchain = async () => {
  try {
    // Get accounts from Ganache
    const accounts = await web3.eth.getAccounts();

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Get the current block number (total blocks mined)
    const currentBlock = await web3.eth.getBlockNumber();

    return { accounts, contract, web3, currentBlock };
  } catch (error) {
    console.error("Error getting blockchain:", error);
  }
};
