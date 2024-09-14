(function() {
  // Inject script into page context
  const script = document.createElement('script');
  script.textContent = '(' + function() {
    const logTypes = ['log', 'info', 'warn', 'error'];

    logTypes.forEach(type => {
      const original = console[type];
      console[type] = function(...args) {
        original.apply(console, args);
        window.postMessage({
          source: 'ConsoleCapture',
          type: type,
          args: args
        }, '*');
      };
    });
  } + ')();';
  document.documentElement.appendChild(script);
  script.remove();

  // Listen for messages from page context
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data && event.data.source === 'ConsoleCapture') {
      chrome.runtime.sendMessage(event.data);
    }
  });
})();
