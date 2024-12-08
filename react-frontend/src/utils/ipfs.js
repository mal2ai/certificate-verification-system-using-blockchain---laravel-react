import { create } from "ipfs-http-client";

// Create an IPFS instance for the local node
const ipfs = create({
  host: "localhost",
  port: 5001,
  protocol: "http",
});

export const uploadToIPFS = async (file) => {
  try {
    // Upload file to IPFS
    const added = await ipfs.add(file);
    console.log("Uploaded to IPFS locally, CID:", added.cid.toString());
    return added.cid.toString(); // Return the CID
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};
