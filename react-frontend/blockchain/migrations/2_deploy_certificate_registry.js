const SerialVerifier = artifacts.require("CertificateRegistry");

module.exports = async function (deployer) {
  await deployer.deploy(SerialVerifier);
};
