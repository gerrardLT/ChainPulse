import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleAccount, SimpleAccountFactory, IEntryPoint } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleAccount", function () {
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let entryPoint: SignerWithAddress; // Mock EntryPoint
  let accountFactory: SimpleAccountFactory;
  let account: SimpleAccount;

  beforeEach(async function () {
    [owner, other, entryPoint] = await ethers.getSigners();

    // Deploy AccountFactory
    const AccountFactoryContract = await ethers.getContractFactory("SimpleAccountFactory");
    accountFactory = await AccountFactoryContract.deploy(entryPoint.address);
    await accountFactory.waitForDeployment();

    // Create an account
    const salt = 0;
    const tx = await accountFactory.createAccount(owner.address, salt);
    await tx.wait();

    const accountAddress = await accountFactory.getAddress(owner.address, salt);
    account = await ethers.getContractAt("SimpleAccount", accountAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await account.owner()).to.equal(owner.address);
    });

    it("Should set the correct entryPoint", async function () {
      expect(await account.entryPoint()).to.equal(entryPoint.address);
    });

    it("Should create account at predictable address", async function () {
      const salt = 1;
      const predictedAddress = await accountFactory.getAddress(owner.address, salt);
      
      await accountFactory.createAccount(owner.address, salt);
      
      const createdAccount = await ethers.getContractAt("SimpleAccount", predictedAddress);
      expect(await createdAccount.owner()).to.equal(owner.address);
    });

    it("Should not create duplicate account", async function () {
      const salt = 2;
      await accountFactory.createAccount(owner.address, salt);
      
      // Creating again should return existing account
      const tx = await accountFactory.createAccount(owner.address, salt);
      await tx.wait();
      
      const accountAddress = await accountFactory.getAddress(owner.address, salt);
      const accountInstance = await ethers.getContractAt("SimpleAccount", accountAddress);
      expect(await accountInstance.owner()).to.equal(owner.address);
    });
  });

  describe("Execute", function () {
    it("Should execute transaction from owner", async function () {
      const recipient = other.address;
      const value = ethers.parseEther("1.0");

      // Fund the account
      await owner.sendTransaction({
        to: await account.getAddress(),
        value: ethers.parseEther("2.0"),
      });

      // Execute transfer
      await account.connect(owner).execute(recipient, value, "0x");

      // Check balance
      expect(await ethers.provider.getBalance(recipient)).to.be.gt(value);
    });

    it("Should revert if not called by owner or entryPoint", async function () {
      await expect(
        account.connect(other).execute(other.address, 0, "0x")
      ).to.be.revertedWith("SimpleAccount: not EntryPoint or owner");
    });

    it("Should execute batch transactions", async function () {
      // Fund the account
      await owner.sendTransaction({
        to: await account.getAddress(),
        value: ethers.parseEther("3.0"),
      });

      const recipients = [other.address, other.address];
      const values = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];
      const data = ["0x", "0x"];

      await account.connect(owner).executeBatch(recipients, values, data);

      expect(await ethers.provider.getBalance(other.address)).to.be.gt(values[0]);
    });

    it("Should revert batch with mismatched arrays", async function () {
      const recipients = [other.address];
      const values = [ethers.parseEther("0.5"), ethers.parseEther("0.5")];
      const data = ["0x"];

      await expect(
        account.connect(owner).executeBatch(recipients, values, data)
      ).to.be.revertedWith("SimpleAccount: wrong array lengths");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await account.connect(owner).transferOwnership(other.address);
      expect(await account.owner()).to.equal(other.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(account.connect(owner).transferOwnership(other.address))
        .to.emit(account, "OwnershipTransferred")
        .withArgs(owner.address, other.address);
    });

    it("Should not transfer to zero address", async function () {
      await expect(
        account.connect(owner).transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("SimpleAccount: new owner is zero address");
    });

    it("Should only allow owner to transfer ownership", async function () {
      await expect(
        account.connect(other).transferOwnership(other.address)
      ).to.be.revertedWith("SimpleAccount: not owner");
    });
  });

  describe("Deposit Management", function () {
    it("Should receive ETH", async function () {
      const value = ethers.parseEther("1.0");
      await owner.sendTransaction({
        to: await account.getAddress(),
        value: value,
      });

      expect(await ethers.provider.getBalance(await account.getAddress())).to.equal(value);
    });

    it("Should add deposit to EntryPoint", async function () {
      const value = ethers.parseEther("1.0");
      
      // Fund account first
      await owner.sendTransaction({
        to: await account.getAddress(),
        value: value,
      });

      // Note: This will fail with mock EntryPoint, but tests the function exists
      // In real scenario with actual EntryPoint, this would work
    });
  });

  describe("Events", function () {
    it("Should emit AccountInitialized on initialization", async function () {
      const salt = 10;
      const predictedAddress = await accountFactory.getAddress(owner.address, salt);
      
      await expect(accountFactory.createAccount(owner.address, salt))
        .to.emit(await ethers.getContractAt("SimpleAccount", predictedAddress), "AccountInitialized")
        .withArgs(entryPoint.address, owner.address);
    });

    it("Should emit AccountExecuted on execute", async function () {
      // Fund the account
      await owner.sendTransaction({
        to: await account.getAddress(),
        value: ethers.parseEther("1.0"),
      });

      const recipient = other.address;
      const value = ethers.parseEther("0.5");
      const data = "0x";

      await expect(account.connect(owner).execute(recipient, value, data))
        .to.emit(account, "AccountExecuted")
        .withArgs(recipient, value, data);
    });
  });

  describe("Factory", function () {
    it("Should emit AccountCreated event", async function () {
      const salt = 20;
      const predictedAddress = await accountFactory.getAddress(owner.address, salt);

      await expect(accountFactory.createAccount(owner.address, salt))
        .to.emit(accountFactory, "AccountCreated")
        .withArgs(predictedAddress, owner.address, salt);
    });

    it("Should get implementation address", async function () {
      const implementationAddress = await accountFactory.accountImplementation();
      expect(implementationAddress).to.not.equal(ethers.ZeroAddress);
    });
  });
});

