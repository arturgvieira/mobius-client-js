import { Network, Networks } from "stellar-sdk";
import Client from "../src/client";

describe("Client", () => {
  describe("should respect global Network config...", () => {
    test("...on test network", () => {
      Network.useTestNetwork();

      const clientInstance = new Client();

      expect(clientInstance.network.networkPassphrase()).toEqual(
        Networks.TESTNET
      );
    });

    test("...on public network", () => {
      Network.usePublicNetwork();

      const clientInstance = new Client();

      expect(clientInstance.network.networkPassphrase()).toEqual(
        Networks.PUBLIC
      );
    });
  });
});
