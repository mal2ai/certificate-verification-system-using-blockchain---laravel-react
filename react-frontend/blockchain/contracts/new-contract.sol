// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CertificateRegistry {
    struct Certificate {
        string serialNumber;
        string name;
        string cid; // IPFS CID for the PDF
        string icNumber;
        string studentId;
        string courseName;
        string issuedDate;
    }

    mapping(string => Certificate) private certificates;
    string[] private certificateSerialNumbers; // To store all serial numbers

    // Events for tracking transactions
    event CertificateRegistered(
        string serialNumber,
        string name,
        string cid,
        string icNumber,
        string studentId,
        string courseName,
        string issuedDate,
        address indexed sender,
        uint256 timestamp
    );
    
    event CertificateUpdated(
        string serialNumber,
        string newName,
        string newCid,
        string newIcNumber,
        string newStudentId,
        string newCourseName,
        string newIssuedDate,
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
        uint256 timestamp
    );

    // Register a certificate
    function registerCertificate(
        string memory serialNumber,
        string memory name,
        string memory cid,
        string memory icNumber,
        string memory studentId,
        string memory courseName,
        string memory issuedDate
    ) public {
        certificates[serialNumber] = Certificate(
            serialNumber, 
            name, 
            cid, 
            icNumber, 
            studentId, 
            courseName, 
            issuedDate
        );
        certificateSerialNumbers.push(serialNumber);
        
        emit CertificateRegistered(
            serialNumber, 
            name, 
            cid, 
            icNumber, 
            studentId, 
            courseName, 
            issuedDate, 
            msg.sender, 
            block.timestamp
        );
    }

    // Get a specific certificate
    function getCertificate(
        string memory serialNumber
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        Certificate memory cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");
        return (
            cert.serialNumber,
            cert.name,
            cert.cid,
            cert.icNumber,
            cert.studentId,
            cert.courseName,
            cert.issuedDate
        );
    }

    // Get all certificates' details
    function getAllCertificates()
        public
        view
        returns (
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            string[] memory
        )
    {
        uint256 length = certificateSerialNumbers.length;
        string[] memory serialNumbers = new string[](length);
        string[] memory names = new string[](length);
        string[] memory cids = new string[](length);
        string[] memory icNumbers = new string[](length);
        string[] memory studentIds = new string[](length);
        string[] memory courseNames = new string[](length);
        string[] memory issuedDates = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            string memory serialNumber = certificateSerialNumbers[i];
            Certificate memory cert = certificates[serialNumber];
            serialNumbers[i] = cert.serialNumber;
            names[i] = cert.name;
            cids[i] = cert.cid;
            icNumbers[i] = cert.icNumber;
            studentIds[i] = cert.studentId;
            courseNames[i] = cert.courseName;
            issuedDates[i] = cert.issuedDate;
        }

        return (
            serialNumbers,
            names,
            cids,
            icNumbers,
            studentIds,
            courseNames,
            issuedDates
        );
    }

    // Verify a certificate
    function verifyCertificate(string memory serialNumber) public {
        // Check if the certificate exists
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");

        // Emit an event to record the verification
        emit CertificateVerified(serialNumber, msg.sender, block.timestamp);
    }

    // Update an existing certificate's details
    function updateCertificate(
        string memory serialNumber,
        string memory newName,
        string memory newCid,
        string memory newIcNumber,
        string memory newStudentId,
        string memory newCourseName,
        string memory newIssuedDate
    ) public {
        Certificate storage cert = certificates[serialNumber];
        require(bytes(cert.serialNumber).length > 0, "Certificate not found");
        cert.name = newName;
        cert.cid = newCid;
        cert.icNumber = newIcNumber;
        cert.studentId = newStudentId;
        cert.courseName = newCourseName;
        cert.issuedDate = newIssuedDate;

        emit CertificateUpdated(
            serialNumber,
            newName,
            newCid,
            newIcNumber,
            newStudentId,
            newCourseName,
            newIssuedDate,
            msg.sender,
            block.timestamp
        );
    }

    // Delete a certificate by serial number
    function deleteCertificate(string memory serialNumber) public {
        require(bytes(certificates[serialNumber].serialNumber).length > 0, "Certificate not found");
        delete certificates[serialNumber];

        uint256 indexToDelete = certificateSerialNumbers.length;
        for (uint256 i = 0; i < certificateSerialNumbers.length; i++) {
            if (keccak256(abi.encodePacked(certificateSerialNumbers[i])) == keccak256(abi.encodePacked(serialNumber))) {
                indexToDelete = i;
                break;
            }
        }

        if (indexToDelete < certificateSerialNumbers.length) {
            certificateSerialNumbers[indexToDelete] = certificateSerialNumbers[certificateSerialNumbers.length - 1];
            certificateSerialNumbers.pop();
        }

        emit CertificateDeleted(serialNumber, msg.sender, block.timestamp);
    }
}
