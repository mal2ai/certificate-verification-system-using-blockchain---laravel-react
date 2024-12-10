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
}
