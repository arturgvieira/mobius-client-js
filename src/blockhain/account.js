import { Keypair } from "stellar-sdk";
import Client from "../client";

/** Service class used to interact with account on Stellar network. */
export default class Account {
  /**
   * @param {object} account
   * @param {StellarSdk.Keypair} keypair
   */
  constructor(account, keypair) {
    this._account = account;
    this._keypair = keypair;
    this._assetIssuers = [];
  }

  /**
   * @returns {StellarSdk.Keypair} Keypair object for current account
   */
  get keypair() {
    return this._keypair;
  }

  /**
   * @returns {object} Account information
   */
  get info() {
    return this._account;
  }

  /**
   * @param {StellarSdk.Keypair} toKeypair
   * @returns {boolean} true if given keypair is added as cosigner to current account
   */
  authorized(toKeypair) {
    const signer = this._findSigner(toKeypair.publicKey());

    return !!signer;
  }

  /**
   * @param {StellarSdk.Asset} [asset=Client.stellarAsset]
   * @returns {number} balance for given asset
   */
  balance(asset = Client.stellarAsset) {
    const balance = this._findBalance(asset);

    return parseFloat((balance || {}).balance);
  }

  /**
   * @param {StellarSdk.Asset}
   * @returns {boolean} true if trustline exists for given asset and limit is positive
   */
  trustlineExists(asset = Client.stellarAsset) {
    const balance = this._findBalance(asset);
    const limit = parseFloat((balance || {}).limit);

    return limit > 0;
  }

  /**
   * Invalidates current account information.
   * @returns {Promise}
   */
  reload() {
    this._account = null;

    return new Promise((resolve, reject) => {
      const accountId = this._keypair.publicKey();

      new Client().horizonClient
        .loadAccount(accountId)
        .then(account => {
          this._account = account;

          resolve(this);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * @private
   * @param {StellarSdk.Asset} asset - Asset to compare
   * @param {any} balance - balance entry to compare
   * @returns {boolean} true if balance matches with given asset
   */
  _balanceMatches(asset, balance) {
    const {
      asset_type: assetType,
      asset_code: assetCode,
      asset_issuer: assetIssuer
    } = balance;

    if (asset.isNative()) {
      return assetType === "native";
    }

    this._assetIssuers[assetCode] =
      this._assetIssuers[assetCode] ||
      Keypair.fromPublicKey(asset.issuer).publicKey();

    return (
      assetCode === asset.code && assetIssuer === this._assetIssuers[assetCode]
    );
  }

  /**
   * @private
   * @param {StellarSdk.Asset} asset - Asset to find
   * @returns {object} matched balance
   */
  _findBalance(asset) {
    const balance = this._account.balances.find(b =>
      this._balanceMatches(asset, b)
    );

    return balance;
  }

  /**
   * @private
   * @param {string} publicKey - signer's key to find
   * @returns {object} matched signer
   */
  _findSigner(publicKey) {
    const signer = this._account.signers.find(s => s.public_key === publicKey);

    return signer;
  }
}
