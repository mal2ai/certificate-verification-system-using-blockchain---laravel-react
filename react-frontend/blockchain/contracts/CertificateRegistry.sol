// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    address private admin;

    struct Certificate {
        string serialNumber;
        string name;
        string certCID; // IPFS CID for the PDF
        string icNumber;
        string studentId;
        string courseName;
        string issuedDate;
        string certHash; // Hash of the certificate PDF
        string transCID; // IPFS CID for the transcript
    }

    mapping(string => Certificate) private certificates;
    mapping(string => string) private certHashToSerial; 
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
        string memory certCID,
        string memory icNumber,
        string memory studentId,
        string memory courseName,
        string memory issuedDate,
        string memory certHash,
        string memory transCID
    ) public onlyAdmin {
        require(bytes(certificates[serialNumber].serialNumber).length == 0, "Certificate already registered");
        require(bytes(certHashToSerial[certHash]).length == 0, "Certificate hash already exists");

        certificates[serialNumber] = Certificate(
            serialNumber,
            name,
            certCID,
            icNumber,
            studentId,
            courseName,
            issuedDate,
            certHash,
            transCID
        );

        certificateSerialNumbers.push(serialNumber);
        certHashToSerial[certHash] = serialNumber; // Store hash-to-serial mapping

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

    function getCertificateByHash(string memory certHash)
        public
        view
        returns (Certificate memory)
    {
        string memory serialNumber = certHashToSerial[certHash];
        require(bytes(serialNumber).length > 0, "Certificate not found");

        return certificates[serialNumber];
    }

    function getAllCertificates() public view onlyAdmin returns (Certificate[] memory) {
        uint256 length = certificateSerialNumbers.length;
        Certificate[] memory allCertificates = new Certificate[](length);

        for (uint256 i = 0; i < length; i++) {
            allCertificates[i] = certificates[certificateSerialNumbers[i]];
        }

        return allCertificates;
    }

    function verifyCertificate(string memory serialNumber) public {
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");

        emit CertificateVerified(serialNumber, msg.sender, block.timestamp, true);
    }

    function verifyCertificateByHash(string memory certHash) public returns (string memory) {
        string memory serialNumber = certHashToSerial[certHash];
        require(bytes(serialNumber).length > 0, "Certificate not found");

        emit CertificateVerified(serialNumber, msg.sender, block.timestamp, true);
        return serialNumber;
    }

    function updateCertificate(
        string memory serialNumber,
        string memory newName,
        string memory newCertCID,
        string memory newIcNumber,
        string memory newStudentId,
        string memory newCourseName,
        string memory newIssuedDate,
        string memory newCertHash,
        string memory newTransCID
    ) public onlyAdmin {
        Certificate storage cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");

        cert.name = newName;
        cert.certCID = newCertCID;
        cert.icNumber = newIcNumber;
        cert.studentId = newStudentId;
        cert.courseName = newCourseName;
        cert.issuedDate = newIssuedDate;
        cert.certHash = newCertHash;
        cert.transCID = newTransCID;

        emit CertificateUpdated(serialNumber, msg.sender, block.timestamp);
    }

    function deleteCertificate(string memory serialNumber) public onlyAdmin {
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");

        // Delete from certHashToSerial mapping
        string memory storedHash = certHashToSerial[serialNumber];
        delete certHashToSerial[storedHash];

        // Delete from certificates mapping
        delete certificates[serialNumber];

        // Remove from certificateSerialNumbers array
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
