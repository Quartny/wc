/* InBuild EIP-1193 provider demo */
(function (window) {
  var state = {
    account: '0x1234567890123456789012345678901234567890',
    chainId: '0x1',
    networkVersion: '1',
    connected: false
  };
  var listeners = Object.create(null);

  function emit(eventName, payload) {
    (listeners[eventName] || []).slice().forEach(function (listener) {
      listener(payload);
    });
  }

  function on(eventName, listener) {
    if (typeof listener !== 'function') return provider;
    (listeners[eventName] || (listeners[eventName] = [])).push(listener);
    return provider;
  }

  function removeListener(eventName, listener) {
    var eventListeners = listeners[eventName] || [];
    listeners[eventName] = eventListeners.filter(function (registeredListener) {
      return registeredListener !== listener;
    });
    return provider;
  }

  function providerError(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  var provider = {
    isInBuild: true,
    isConnected: function () {
      return state.connected;
    },
    request: async function (request) {
      var method = request && request.method;

      switch (method) {
        case 'eth_requestAccounts':
          state.connected = true;
          emit('connect', { chainId: state.chainId });
          emit('accountsChanged', [state.account]);
          return [state.account];
        case 'eth_accounts':
          return state.connected ? [state.account] : [];
        case 'eth_chainId':
          return state.chainId;
        case 'net_version':
          return state.networkVersion;
        case 'wallet_requestPermissions':
          return [{ parentCapability: 'eth_accounts' }];
        case 'wallet_getPermissions':
          return state.connected ? [{ parentCapability: 'eth_accounts' }] : [];
        case 'wallet_switchEthereumChain':
          if (!request.params || !request.params[0] || !request.params[0].chainId) {
            throw providerError(-32602, 'A chainId is required.');
          }
          state.chainId = request.params[0].chainId;
          state.networkVersion = String(parseInt(state.chainId, 16));
          emit('chainChanged', state.chainId);
          return null;
        default:
          throw providerError(4200, 'Unsupported method: ' + method);
      }
    },
    on: on,
    addListener: on,
    removeListener: removeListener,
    off: removeListener,
    disconnect: function () {
      if (!state.connected) return;
      state.connected = false;
      emit('accountsChanged', []);
      emit('disconnect', providerError(4900, 'Provider disconnected.'));
    }
  };

  // tests: window.ZunexInBuildProvider.connect().
  provider.connect = function () {
    return provider.request({ method: 'eth_requestAccounts' });
  };

  window.ZunexInBuildProvider = provider;
}(window));
