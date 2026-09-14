/*
 * Example InBuild provider.
 * Replace the demo account and request handlers with your real wallet logic.
 */
(function (window) {
  var demoAccount = '0x1234567890123456789012345678901234567890';

  var provider = {
    request: async function (request) {
      switch (request.method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return [demoAccount];
        case 'eth_chainId':
          return '0x1';
        case 'net_version':
          return '1';
        case 'wallet_requestPermissions':
          return [{ parentCapability: 'eth_accounts' }];
        default:
          throw new Error('Unsupported method: ' + request.method);
      }
    }
  };

  // The Zunex runtime reads this global after loading the script.
  window.ZunexInBuildProvider = provider;
}(window));
