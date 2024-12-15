// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    struct Certificate {
        string serialNumber;
        string name;
        string cid; // IPFS CID for the PDF
    }

    mapping(string => Certificate) private certificates;
    string[] private certificateSerialNumbers; // To store all serial numbers

    // Register a certificate
    function registerCertificate(
        string memory serialNumber,
        string memory name,
        string memory cid
    ) public {
        // Add the certificate to the mapping
        certificates[serialNumber] = Certificate(serialNumber, name, cid);
        
        // Add the serial number to the array
        certificateSerialNumbers.push(serialNumber);
    }

    // Get a specific certificate
    function getCertificate(
        string memory serialNumber
    ) public view returns (string memory, string memory, string memory) {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");
        return (cert.serialNumber, cert.name, cert.cid);
    }

    // Get all certificates' details (serialNumber, name, and cid)
    function getAllCertificates() public view returns (string[] memory, string[] memory, string[] memory) {
        string[] memory serialNumbers = new string[](certificateSerialNumbers.length);
        string[] memory names = new string[](certificateSerialNumbers.length);
        string[] memory cids = new string[](certificateSerialNumbers.length);

        for (uint i = 0; i < certificateSerialNumbers.length; i++) {
            string memory serialNumber = certificateSerialNumbers[i];
            Certificate memory cert = certificates[serialNumber];
            serialNumbers[i] = cert.serialNumber;
            names[i] = cert.name;
            cids[i] = cert.cid;
        }

        return (serialNumbers, names, cids);
    }

    // Update an existing certificate's name and CID by serial number
    function updateCertificate(
        string memory serialNumber,
        string memory newName,
        string memory newCid
    ) public {
        Certificate storage cert = certificates[serialNumber];
        
        // Check if the certificate exists
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");

        // Update the certificate details
        cert.name = newName;
        cert.cid = newCid;
    }

    // Delete a certificate by serial number
    function deleteCertificate(string memory serialNumber) public {
        // Check if the certificate exists
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");

        // Delete the certificate from the mapping
        delete certificates[serialNumber];

        // Find the index of the serial number in the array
        uint256 indexToDelete = certificateSerialNumbers.length;
        for (uint256 i = 0; i < certificateSerialNumbers.length; i++) {
            if (keccak256(abi.encodePacked(certificateSerialNumbers[i])) == keccak256(abi.encodePacked(serialNumber))) {
                indexToDelete = i;
                break;
            }
        }

        // If the serial number was found, remove it from the array
        if (indexToDelete < certificateSerialNumbers.length) {
            certificateSerialNumbers[indexToDelete] = certificateSerialNumbers[certificateSerialNumbers.length - 1];
            certificateSerialNumbers.pop(); // Remove the last element
        }
    }
}
