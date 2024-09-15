// content.js

(function() {
  console.log('ConsoleCapture: content.js loaded.');

  function handleMessage(event) {
    if (event.source !== window) return;
    if (event.data && event.data.source === 'ConsoleCapture') {
      console.log('ConsoleCapture: Sending message to background:', event.data);
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(event.data, function(response) {
          if (chrome.runtime.lastError) {
            console.error('ConsoleCapture: Error sending message:', chrome.runtime.lastError.message);
          } else {
            console.log('ConsoleCapture: Message sent successfully:', response);
          }
        });
      } else {
        console.error('ConsoleCapture: chrome.runtime.sendMessage is not available.');
      }
    }
  }

  window.addEventListener('message', handleMessage);
})();
