import Web3 from "web3";

// Connect to Ganache (Local Ethereum Node)
const web3 = new Web3("http://127.0.0.1:7545"); // Replace with your Ganache RPC URL

const contractAddress = "0x724f914399A28A19d4AC122DE6D0f088Cc503DC4";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
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
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "string",
        name: "icNumber",
        type: "string",
      },
      {
        internalType: "string",
        name: "studentId",
        type: "string",
      },
      {
        internalType: "string",
        name: "courseName",
        type: "string",
      },
      {
        internalType: "string",
        name: "issuedDate",
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
    ],
    name: "verifyCertificate",
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
      {
        internalType: "string",
        name: "newIcNumber",
        type: "string",
      },
      {
        internalType: "string",
        name: "newStudentId",
        type: "string",
      },
      {
        internalType: "string",
        name: "newCourseName",
        type: "string",
      },
      {
        internalType: "string",
        name: "newIssuedDate",
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
  {
    inputs: [],
    name: "getCertificatesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "icNumber",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "studentId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "courseName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "issuedDate",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newCid",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newIcNumber",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newStudentId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newCourseName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "newIssuedDate",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "verifier",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateVerified",
    type: "event",
  },
];

// Create and export the getBlockchain function
// export const getBlockchain = async () => {
//   try {
//     // Get accounts from Ganache
//     const accounts = await web3.eth.getAccounts();

//     // Create contract instance
//     const contract = new web3.eth.Contract(contractABI, contractAddress);

//     // Get the current block number (total blocks mined)
//     const currentBlock = await web3.eth.getBlockNumber();

//     return { accounts, contract, web3, currentBlock };
//   } catch (error) {
//     console.error("Error getting blockchain:", error);
//   }
// };

export const getBlockchain = async () => {
  try {
    // Get accounts from Ganache
    const accounts = await web3.eth.getAccounts();

    // Define roles (this is for frontend guidance)
    const adminAccount = accounts[0]; // Admin is always the first account
    const userAccount = accounts[1]; // Public user is the second account

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Get the current block number (total blocks mined)
    const currentBlock = await web3.eth.getBlockNumber();

    return { adminAccount, userAccount, contract, web3, currentBlock };
  } catch (error) {
    console.error("Error getting blockchain:", error);
  }
};
