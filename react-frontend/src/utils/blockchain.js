import Web3 from "web3";

// Connect to Ganache (Local Ethereum Node)
const web3 = new Web3("http://127.0.0.1:7545"); // Replace with your Ganache RPC URL

const contractAddress = "0xD34131Ff68afDCa9D316593D6e796035E5086cf1";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "string", name: "serialNumber", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "cid", type: "string" },
      { internalType: "string", name: "icNumber", type: "string" },
      { internalType: "string", name: "studentId", type: "string" },
      { internalType: "string", name: "courseName", type: "string" },
      { internalType: "string", name: "issuedDate", type: "string" },
      { internalType: "string", name: "certHash", type: "string" },
    ],
    name: "registerCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
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
    name: "CertificateRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
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
    name: "CertificateUpdated",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      { name: "serialNumber", type: "string" },
      { name: "name", type: "string" },
      { name: "ipfsCID", type: "string" },
      { name: "icNumber", type: "string" },
      { name: "studentId", type: "string" },
      { name: "courseName", type: "string" },
      { name: "issuedDate", type: "string" },
      { name: "fileHash", type: "string" }, // File hash parameter
    ],
    name: "updateCertificate",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
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
        indexed: false,
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
      {
        indexed: false,
        internalType: "bool",
        name: "verified",
        type: "bool",
      },
    ],
    name: "CertificateVerified",
    type: "event",
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
    inputs: [
      {
        internalType: "string",
        name: "serialNumber",
        type: "string",
      },
      {
        internalType: "string",
        name: "providedHash",
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
    ],
    name: "getCertificate",
    outputs: [
      {
        components: [
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
          {
            internalType: "string",
            name: "certHash",
            type: "string",
          },
        ],
        internalType: "struct CertificateRegistry.Certificate",
        name: "",
        type: "tuple",
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
        components: [
          { internalType: "string", name: "serialNumber", type: "string" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "cid", type: "string" },
          { internalType: "string", name: "icNumber", type: "string" },
          { internalType: "string", name: "studentId", type: "string" },
          { internalType: "string", name: "courseName", type: "string" },
          { internalType: "string", name: "issuedDate", type: "string" },
          { internalType: "string", name: "certHash", type: "string" },
        ],
        internalType: "struct Certificate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "serialNumber", type: "string" }, // Only serial number needed for deletion
    ],
    name: "deleteCertificate",
    outputs: [
      { name: "", type: "bool" }, // Success or failure of deletion
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
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
