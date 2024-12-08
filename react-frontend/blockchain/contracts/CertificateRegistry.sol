// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    struct Certificate {
        string serialNumber;
        string name;
        string cid; // IPFS CID for the PDF
    }

    mapping(string => Certificate) private certificates;

    function registerCertificate(
        string memory serialNumber,
        string memory name,
        string memory cid
    ) public {
        certificates[serialNumber] = Certificate(serialNumber, name, cid);
    }

    function getCertificate(
        string memory serialNumber
    ) public view returns (string memory, string memory, string memory) {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");
        return (cert.serialNumber, cert.name, cert.cid);
    }
}
