// inject.js

(function() {
  if (window.__ConsoleCaptureInjected) {
    console.log('ConsoleCapture: Scripts already injected.');
    return;
  }
  window.__ConsoleCaptureInjected = true;

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

  console.log('ConsoleCapture: inject.js injected successfully.');

  // Observe DOM changes to handle dynamic content (e.g., SPA route changes)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Placeholder for any necessary logic upon DOM changes
      // For example, re-inject scripts or handle dynamically added console methods
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  console.log('ConsoleCapture: MutationObserver set up.');
})();
