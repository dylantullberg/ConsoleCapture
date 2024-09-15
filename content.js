// content.js

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

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      window.postMessage({
        source: 'ConsoleCapture',
        type: 'unhandledPromiseRejection',
        reason: event.reason
      }, '*');
    });

    // Listen for errors/exceptions
    window.addEventListener('error', function(event) {
      window.postMessage({
        source: 'ConsoleCapture',
        type: 'exception',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }, '*');
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
