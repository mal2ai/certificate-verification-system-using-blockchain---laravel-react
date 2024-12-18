// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address private admin;

    struct Certificate {
        string serialNumber;
        string name;
        string cid; // IPFS CID for the PDF
        string icNumber;
        string studentId;
        string courseName;
        string issuedDate;
        string certHash; // Hash of the certificate PDF
    }

    mapping(string => Certificate) private certificates;
    string[] private certificateSerialNumbers; // To store all serial numbers

    // Events for tracking transactions
    event CertificateRegistered(
        string serialNumber,
        address indexed sender,
        uint256 timestamp
    );

    event CertificateUpdated(
        string serialNumber,
        address indexed sender,
        uint256 timestamp
    );

    event CertificateDeleted(
        string serialNumber,
        address indexed sender,
        uint256 timestamp
    );

    event CertificateVerified(
        string serialNumber,
        address indexed verifier,
        uint256 timestamp,
        bool verified
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerCertificate(
        string memory serialNumber,
        string memory name,
        string memory cid,
        string memory icNumber,
        string memory studentId,
        string memory courseName,
        string memory issuedDate,
        string memory certHash
    ) public onlyAdmin {
        certificates[serialNumber] = Certificate(
            serialNumber,
            name,
            cid,
            icNumber,
            studentId,
            courseName,
            issuedDate,
            certHash
        );
        certificateSerialNumbers.push(serialNumber);

        emit CertificateRegistered(serialNumber, msg.sender, block.timestamp);
    }

    function getCertificate(string memory serialNumber)
        public
        view
        returns (Certificate memory)
    {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");
        return cert;
    }

    function getAllCertificates() public view onlyAdmin returns (Certificate[] memory) {
        uint256 length = certificateSerialNumbers.length;
        Certificate[] memory allCertificates = new Certificate[](length);

        for (uint256 i = 0; i < length; i++) {
            allCertificates[i] = certificates[certificateSerialNumbers[i]];
        }

        return allCertificates;
    }

    function verifyCertificate(string memory serialNumber, string memory providedHash) public {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");

        bool isVerified = keccak256(abi.encodePacked(cert.certHash)) == keccak256(abi.encodePacked(providedHash));

        emit CertificateVerified(serialNumber, msg.sender, block.timestamp, isVerified);

        require(isVerified, "Certificate hash does not match");
    }

    function updateCertificate(
        string memory serialNumber,
        string memory newName,
        string memory newCid,
        string memory newIcNumber,
        string memory newStudentId,
        string memory newCourseName,
        string memory newIssuedDate,
        string memory newCertHash
    ) public onlyAdmin {
        Certificate storage cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");

        cert.name = newName;
        cert.cid = newCid;
        cert.icNumber = newIcNumber;
        cert.studentId = newStudentId;
        cert.courseName = newCourseName;
        cert.issuedDate = newIssuedDate;
        cert.certHash = newCertHash;

        emit CertificateUpdated(serialNumber, msg.sender, block.timestamp);
    }

    function deleteCertificate(string memory serialNumber) public onlyAdmin {
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");

        delete certificates[serialNumber];

        for (uint256 i = 0; i < certificateSerialNumbers.length; i++) {
            if (keccak256(abi.encodePacked(certificateSerialNumbers[i])) == keccak256(abi.encodePacked(serialNumber))) {
                certificateSerialNumbers[i] = certificateSerialNumbers[certificateSerialNumbers.length - 1];
                certificateSerialNumbers.pop();
                break;
            }
        }

        emit CertificateDeleted(serialNumber, msg.sender, block.timestamp);
    }

    function getCertificatesCount() public view returns (uint256) {
        return certificateSerialNumbers.length;
    }
}
