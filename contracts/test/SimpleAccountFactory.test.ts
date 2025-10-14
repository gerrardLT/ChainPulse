import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleAccountFactory, SimpleAccount } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleAccountFactory", function () {
  let factory: SimpleAccountFactory;
  let implementation: SimpleAccount;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  const ENTRY_POINT = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SimpleAccountFactory");
    factory = await Factory.deploy(ENTRY_POINT);
    await factory.waitForDeployment();

    const implAddr = await factory.accountImplementation();
    implementation = await ethers.getContractAt("SimpleAccount", implAddr);
  });

  describe("getAddress", function () {
    it("should return different address than factory", async function () {
      const factoryAddr = await factory.getAddress(); // ethers method
      const predicted = await factory["getAddress(address,uint256)"](user.address, 0); // contract method
      
      console.log("Factory:", factoryAddr);
      console.log("Predicted:", predicted);
      
      expect(predicted).to.not.equal(factoryAddr);
    });

    it("should return different addresses for different salts", async function () {
      const addr1 = await factory["getAddress(address,uint256)"](user.address, 0);
      const addr2 = await factory["getAddress(address,uint256)"](user.address, 1);
      
      expect(addr1).to.not.equal(addr2);
    });

    it("should return same address for same parameters", async function () {
      const addr1 = await factory["getAddress(address,uint256)"](user.address, 0);
      const addr2 = await factory["getAddress(address,uint256)"](user.address, 0);
      
      expect(addr1).to.equal(addr2);
    });
  });

  describe("createAccount", function () {
    it("should deploy account at predicted address", async function () {
      const salt = 0;
      const predicted = await factory["getAddress(address,uint256)"](user.address, salt);
      
      const tx = await factory.createAccount(user.address, salt);
      await tx.wait();
      
      const code = await ethers.provider.getCode(predicted);
      expect(code).to.not.equal("0x");
    });

    it("deployed account should have correct owner", async function () {
      const salt = 0;
      const predicted = await factory["getAddress(address,uint256)"](user.address, salt);
      
      await factory.createAccount(user.address, salt);
      
      const account = await ethers.getContractAt("SimpleAccount", predicted);
      const accountOwner = await account.owner();
      
      expect(accountOwner).to.equal(user.address);
    });
  });
});

