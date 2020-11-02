import { ethers } from 'ethers';

export class SignerWithAddress extends ethers.Signer {
  public static async create(signer: ethers.Signer) {
    return new SignerWithAddress(await signer.getAddress(), signer);
  }

  private constructor(public readonly address: string, private readonly signer: ethers.Signer) {
    super();
    (this as any).provider = signer.provider;
  }

  public async getAddress(): Promise<string> {
    return this.address;
  }

  public signMessage(message: string | ethers.utils.Bytes): Promise<string> {
    return this.signer.signMessage(message);
  }

  public signTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<string> {
    return this.signer.signTransaction(transaction);
  }

  public sendTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionResponse> {
    return this.signer.sendTransaction(transaction);
  }

  public connect(provider: ethers.providers.Provider): SignerWithAddress {
    return new SignerWithAddress(this.address, this.signer.connect(provider));
  }
}
