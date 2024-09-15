// background.js

// Initialize the tabsInfo object to track each tab's state
// Using a Map for better performance and clarity
let tabsInfo = new Map();

/**
 * Formats log entries received from content scripts.
 * @param {string} type - The type of the log (e.g., 'log', 'info', 'warn', 'error').
 * @param {Array} args - The arguments passed to the console method.
 * @returns {Object} - Formatted log entry.
 */
function formatContentLog(type, args) {
  const timestamp = new Date().toISOString();
  let category = type.toUpperCase();

  // Further categorize if needed
  if (category === 'ERROR') {
    const text = args.map(arg => formatArgument(arg)).join(' ');
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION'; // Grouping under 'EXCEPTION'
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (category === 'WARNING') {
    const text = args.map(arg => formatArgument(arg)).join(' ');
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  const messageText = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');

  return {
    timestamp: timestamp,
    level: category,
    message: `[${timestamp}] [${category}] ${messageText}`
  };
}

/**
 * Formats unhandled promise rejections.
 * @param {*} reason - The reason for the unhandled rejection.
 * @returns {Object} - Formatted exception entry.
 */
function formatUnhandledRejection(reason) {
  const timestamp = new Date().toISOString();
  let messageText = '';
  if (typeof reason === 'object') {
    messageText = JSON.stringify(reason);
  } else {
    messageText = String(reason);
  }
  return {
    timestamp: timestamp,
    level: 'EXCEPTION',
    message: `[${timestamp}] [EXCEPTION] Unhandled Promise Rejection: ${messageText}`
  };
}

/**
 * Formats exceptions thrown in the console.
 * @param {Object} message - The exception message.
 * @returns {Object} - Formatted exception entry.
 */
function formatContentException(message) {
  const timestamp = new Date().toISOString();
  const text = message.message || '';
  return {
    timestamp: timestamp,
    level: 'EXCEPTION',
    message: `[${timestamp}] [EXCEPTION] ${text}`
  };
}

/**
 * Formats log entries received from the debugger API.
 * @param {Object} entry - The log entry from the debugger.
 * @returns {Object} - Formatted log entry.
 */
function formatLogEntry(entry) {
  const timestamp = new Date(entry.timestamp * 1000).toISOString();
  const level = entry.level.toUpperCase();
  const text = entry.text || '';

  // Categorize additional error types based on the level or text
  let category = level;

  if (level === 'ERROR') {
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION';
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (level === 'WARNING') {
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  return {
    timestamp: timestamp,
    level: category,
    message: `[${timestamp}] [${category}] ${text}`
  };
}

/**
 * Formats console messages received from the debugger API.
 * @param {Object} message - The console message from the debugger.
 * @returns {Object} - Formatted console message.
 */
function formatConsoleMessage(message) {
  const timestamp = message.timestamp ? new Date(message.timestamp * 1000).toISOString() : new Date().toISOString();
  let level = message.level.toUpperCase();
  const text = getMessageText(message);

  // Categorize additional error types based on the level or text
  let category = level;

  if (level === 'ERROR') {
    if (text.includes('Unhandled Promise Rejection')) {
      category = 'EXCEPTION';
    } else if (text.includes('Exception')) {
      category = 'EXCEPTION';
    } else if (text.includes('Failed to load resource') || text.includes('Network Error')) {
      category = 'NETWORKERROR';
    } else if (text.includes('CORS policy')) {
      category = 'CORSERROR';
    }
  } else if (level === 'WARNING') {
    if (text.toLowerCase().includes('deprecated')) {
      category = 'DEPRECATIONWARNING';
    } else if (text.toLowerCase().includes('mixed content') || text.toLowerCase().includes('csp')) {
      category = 'SECURITYWARNING';
    }
  }

  return {
    timestamp: timestamp,
    level: category,
    message: `[${timestamp}] [${category}] ${text}`
  };
}

/**
 * Extracts and formats the message text from a console message.
 * @param {Object} message - The console message object.
 * @returns {string} - The formatted message text.
 */
function getMessageText(message) {
  if (message.parameters) {
    return message.parameters.map(param => formatRemoteObject(param)).join(' ');
  }
  return message.text || '';
}

/**
 * Formats remote objects received from the debugger API.
 * @param {Object} obj - The remote object to format.
 * @returns {string} - The formatted remote object.
 */
function formatRemoteObject(obj) {
  if (obj.type === 'string') {
    return obj.value;
  } else if (obj.type === 'object' && obj.subtype === 'null') {
    return 'null';
  } else if (obj.type === 'undefined') {
    return 'undefined';
  } else if (obj.type === 'object' || obj.type === 'function') {
    return obj.description || obj.className || obj.type;
  } else {
    return String(obj.value);
  }
}

/**
 * Formats exceptions thrown in the debugger API.
 * @param {Object} exception - The exception details from the debugger.
 * @returns {Object} - Formatted exception entry.
 */
function formatException(exception) {
  const timestamp = new Date().toISOString();
  const level = 'EXCEPTION';
  const text = exception.exception ? exception.exception.description : exception.text;
  return {
    timestamp: timestamp,
    level: level,
    message: `[${timestamp}] [${level}] ${text}`
  };
}

/**
 * Formats arguments passed to console methods.
 * @param {*} arg - The argument to format.
 * @returns {string} - The formatted argument.
 */
function formatArgument(arg) {
  if (typeof arg === 'string') {
    return arg;
  } else if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg);
    } catch (e) {
      return String(arg);
    }
  } else {
    return String(arg);
  }
}

/**
 * Updates persistent storage with the latest logs for a specific tab.
 * @param {number} tabId - The ID of the tab.
 * @param {Array} logs - The array of log entries.
 */
function updatePersistentStorage(tabId, logs) {
  const storageKey = `logs_${tabId}`;
  chrome.storage.local.set({ [storageKey]: logs }, function() {
    if (chrome.runtime.lastError) {
      console.error(`Failed to update storage for tab ${tabId}: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Storage updated for tab ${tabId}`);
    }
  });
}

/**
 * Retrieves logs from persistent storage for a specific tab.
 * @param {number} tabId - The ID of the tab.
 * @param {Function} callback - The callback function to handle the retrieved logs.
 */
function getPersistentLogs(tabId, callback) {
  const storageKey = `logs_${tabId}`;
  chrome.storage.local.get([storageKey], function(result) {
    if (chrome.runtime.lastError) {
      console.error(`Failed to retrieve storage for tab ${tabId}: ${chrome.runtime.lastError.message}`);
      callback([]);
    } else {
      callback(result[storageKey] || []);
    }
  });
}

/**
 * Starts capturing logs on a specific tab by attaching the debugger and injecting scripts.
 * @param {number} tabId - The ID of the tab.
 */
function startCapturing(tabId) {
  console.log(`Attempting to start capturing on tab ${tabId}`);

  // Check if the URL is restricted
  chrome.tabs.get(tabId, function(tab) {
    if (chrome.runtime.lastError) {
      console.error(`Failed to get tab ${tabId}: ${chrome.runtime.lastError.message}`);
      return;
    }

    const url = tab.url;
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
      console.warn(`Cannot capture logs on restricted URL: ${url}`);
      chrome.runtime.sendMessage({ action: 'showNotification', message: `Cannot capture logs on this page.` });
      return;
    }

    if (!tabsInfo.has(tabId)) {
      tabsInfo.set(tabId, { logs: [], isCapturing: false, debuggerAttached: false });
    }

    if (tabsInfo.get(tabId).debuggerAttached) {
      console.warn(`Debugger already attached to tab ${tabId}`);
      return;
    }

    // Attach debugger
    chrome.debugger.attach({ tabId: tabId }, "1.3", function() {
      if (chrome.runtime.lastError) {
        console.error(`Debugger attach failed on tab ${tabId}: ${chrome.runtime.lastError.message}`);
        chrome.runtime.sendMessage({ action: 'showNotification', message: `Failed to start capturing: ${chrome.runtime.lastError.message}` });
        return;
      }

      console.log(`Debugger attached to tab ${tabId}`);
      tabsInfo.get(tabId).debuggerAttached = true;

      // Enable necessary domains
      chrome.debugger.sendCommand({ tabId: tabId }, "Log.enable");
      chrome.debugger.sendCommand({ tabId: tabId }, "Console.enable");
      chrome.debugger.sendCommand({ tabId: tabId }, "Runtime.enable");
      chrome.debugger.sendCommand({ tabId: tabId }, "Network.enable");

      tabsInfo.get(tabId).isCapturing = true;

      chrome.debugger.onEvent.addListener(onEvent);

      // Inject inject.js into the MAIN world
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['inject.js'],
        world: 'MAIN'
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`inject.js injection failed on tab ${tabId}: ${chrome.runtime.lastError.message}`);
          chrome.runtime.sendMessage({ action: 'showNotification', message: `Failed to inject inject.js: ${chrome.runtime.lastError.message}` });
        } else {
          console.log(`inject.js injected into tab ${tabId}`);
        }
      });

      // Inject content.js into the ISOLATED world
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`content.js injection failed on tab ${tabId}: ${chrome.runtime.lastError.message}`);
          chrome.runtime.sendMessage({ action: 'showNotification', message: `Failed to inject content.js: ${chrome.runtime.lastError.message}` });
        } else {
          console.log(`content.js injected into tab ${tabId}`);

          // Initialize logs from persistent storage
          getPersistentLogs(tabId, function(logs) {
            tabsInfo.get(tabId).logs = logs;
            console.log(`Loaded ${logs.length} logs from storage for tab ${tabId}`);
          });
        }
      });

      chrome.runtime.sendMessage({ action: 'showNotification', message: 'Capturing logs...' });
    });
  });
}

/**
 * Stops capturing logs on a specific tab by detaching the debugger and cleaning up.
 * @param {number} tabId - The ID of the tab.
 */
function stopCapturing(tabId) {
  console.log(`Attempting to stop capturing on tab ${tabId}`);
  if (tabsInfo.has(tabId) && tabsInfo.get(tabId).isCapturing) {
    if (!tabsInfo.get(tabId).debuggerAttached) {
      console.warn(`Debugger not attached to tab ${tabId}, cannot detach.`);
      tabsInfo.get(tabId).isCapturing = false;
      return;
    }

    // Detach debugger
    chrome.debugger.detach({ tabId: tabId }, function() {
      if (chrome.runtime.lastError) {
        console.error(`Debugger detach failed on tab ${tabId}: ${chrome.runtime.lastError.message}`);
        if (chrome.runtime.lastError.message.includes('not attached')) {
          console.warn(`Debugger was not attached to tab ${tabId}.`);
        } else {
          // Handle other errors if necessary
          return;
        }
      } else {
        console.log(`Debugger detached from tab ${tabId}`);
      }

      tabsInfo.get(tabId).isCapturing = false;
      tabsInfo.get(tabId).debuggerAttached = false;
      chrome.debugger.onEvent.removeListener(onEvent);

      // Clear the stored logs
      tabsInfo.get(tabId).logs = [];
      updatePersistentStorage(tabId, []);

      // Reset injection flag by injecting a small script to reset the flag
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          window.__ConsoleCaptureInjected = false;
        }
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Failed to reset injection flag on tab ${tabId}: ${chrome.runtime.lastError.message}`);
        } else {
          console.log(`Injection flag reset on tab ${tabId}`);
        }
      });

      // Notify the popup to refresh the display
      chrome.runtime.sendMessage({ action: 'logsCleared' });
      chrome.runtime.sendMessage({ action: 'showNotification', message: 'Stopped capturing logs.' });
    });
  }
}

/**
 * Handles events received from the debugger API.
 * @param {Object} debuggeeId - The debuggee identifier.
 * @param {string} message - The event message.
 * @param {Object} params - Additional parameters for the event.
 */
function onEvent(debuggeeId, message, params) {
  const tabId = debuggeeId.tabId;
  if (!tabsInfo.has(tabId) || !tabsInfo.get(tabId).isCapturing) return;

  console.log(`Received debugger event on tab ${tabId}: ${message}`);

  let logEntry = null;

  try {
    if (message === "Log.entryAdded") {
      logEntry = formatLogEntry(params.entry);
    } else if (message === "Console.messageAdded") {
      logEntry = formatConsoleMessage(params.message);
    } else if (message === "Runtime.exceptionThrown") {
      const exception = params.exceptionDetails;
      logEntry = formatException(exception);
    }

    if (logEntry) {
      const currentLogs = tabsInfo.get(tabId).logs;
      currentLogs.push(logEntry);
      console.log(`Captured log on tab ${tabId}: ${logEntry.message}`);

      // Update persistent storage
      updatePersistentStorage(tabId, currentLogs);
    }
  } catch (error) {
    console.error(`Error processing debugger event on tab ${tabId}:`, error);
  }
}

/**
 * Handles messages from content scripts.
 * @param {number} tabId - The ID of the tab sending the message.
 * @param {Object} message - The message content.
 */
function handleContentMessage(tabId, message) {
  if (!tabsInfo.has(tabId)) {
    tabsInfo.set(tabId, { logs: [], isCapturing: false, debuggerAttached: false });
  }

  // Only capture logs if capturing is active
  if (!tabsInfo.get(tabId).isCapturing) return;

  let logEntry = null;

  switch (message.type) {
    case 'log':
    case 'info':
    case 'warn':
    case 'error':
      logEntry = formatContentLog(message.type, message.args);
      break;
    case 'unhandledPromiseRejection':
      logEntry = formatUnhandledRejection(message.reason);
      break;
    case 'exception':
      logEntry = formatContentException(message);
      break;
    default:
      // Unknown type
      break;
  }

  if (logEntry) {
    const currentLogs = tabsInfo.get(tabId).logs;
    currentLogs.push(logEntry);
    console.log(`Captured log on tab ${tabId}: ${logEntry.message}`);

    // Update persistent storage
    updatePersistentStorage(tabId, currentLogs);
  }
}

/**
 * Listener for incoming messages from popup.js and content.js.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // If the message is from the injected content script
  if (request.source === 'ConsoleCapture') {
    if (sender.tab && sender.tab.id !== undefined) {
      handleContentMessage(sender.tab.id, request);
      sendResponse({ success: true });
    } else {
      console.error('ConsoleCapture: Sender tab information is missing.');
      sendResponse({ success: false, error: 'Sender tab information is missing.' });
    }
    return;
  }

  const tabId = request.tabId;

  switch (request.action) {
    case 'toggleCapture':
      if (tabsInfo.has(tabId) && tabsInfo.get(tabId).isCapturing) {
        stopCapturing(tabId);
        sendResponse({ isCapturing: false });
      } else {
        startCapturing(tabId);
        sendResponse({ isCapturing: true });
      }
      break;

    case 'getStatus':
      sendResponse({ isCapturing: tabsInfo.has(tabId) && tabsInfo.get(tabId).isCapturing });
      break;

    case 'getLogs':
      sendResponse({ logs: tabsInfo.has(tabId) ? tabsInfo.get(tabId).logs : [] });
      break;

    case 'clearLogs':
      if (tabsInfo.has(tabId)) {
        tabsInfo.get(tabId).logs = [];
        console.log(`Logs cleared for tab ${tabId}`);
        // Update persistent storage
        updatePersistentStorage(tabId, []);
      }
      sendResponse({});
      break;

    case 'showNotification':
      // Relay notification to popup
      chrome.runtime.sendMessage({ action: 'displayNotification', message: request.message });
      sendResponse({ success: true });
      break;

    default:
      sendResponse({});
      break;
  }

  // Indicate that the response will be sent asynchronously if needed
  return true;
});

/**
 * Listener for tab removal to clean up tabsInfo.
 */
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (tabsInfo.has(tabId)) {
    if (tabsInfo.get(tabId).debuggerAttached) {
      chrome.debugger.detach({ tabId: tabId }, function() {
        if (chrome.runtime.lastError) {
          console.error(`Debugger detach failed on tab ${tabId}: ${chrome.runtime.lastError.message}`);
        } else {
          console.log(`Debugger detached from tab ${tabId} due to tab removal.`);
        }
      });
    }
    tabsInfo.delete(tabId);
    console.log(`Cleaned up tab ${tabId} from tabsInfo.`);
    // Remove logs from storage
    const storageKey = `logs_${tabId}`;
    chrome.storage.local.remove([storageKey], function() {
      if (chrome.runtime.lastError) {
        console.error(`Failed to remove storage for tab ${tabId}: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`Storage removed for tab ${tabId}`);
      }
    });
  }
});

/**
 * Listener for navigation events to re-attach debugger and re-inject scripts.
 */
chrome.webNavigation.onCompleted.addListener(function(details) {
  const tabId = details.tabId;

  if (tabsInfo.has(tabId) && tabsInfo.get(tabId).isCapturing) {
    console.log(`Tab ${tabId} completed navigation. Re-attaching debugger and re-injecting scripts.`);
    startCapturing(tabId);
  }
}, { url: [{ schemes: ['http', 'https'] }] });

/**
 * Listener for tab updates (like reload or navigation) to handle capturing appropriately.
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tabsInfo.has(tabId) && changeInfo.status === 'loading') {
    console.log(`Tab ${tabId} is loading. Handling capture accordingly.`);
    if (tabsInfo.get(tabId).isCapturing) {
      stopCapturing(tabId); // Clean up existing capturing
      // Wait for the tab to finish loading before restarting capture
      chrome.tabs.onUpdated.addListener(function listener(updatedTabId, updatedChangeInfo, updatedTab) {
        if (updatedTabId === tabId && updatedChangeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          console.log(`Tab ${tabId} has finished loading. Restarting capture.`);
          startCapturing(tabId);
        }
      });
    }
  }
});

/**
 * Listener for tab activation to ensure capturing is active.
 */
chrome.tabs.onActivated.addListener(function(activeInfo) {
  const tabId = activeInfo.tabId;
  if (tabsInfo.has(tabId) && tabsInfo.get(tabId).isCapturing && !tabsInfo.get(tabId).debuggerAttached) {
    console.log(`Tab ${tabId} activated and capturing is active. Re-attaching debugger.`);
    startCapturing(tabId);
  }
});

/**
 * Listener for service worker startup.
 */
chrome.runtime.onStartup.addListener(function() {
  console.log('ConsoleCapture: Service worker started on browser startup.');
  // Optionally, restore state if needed
});

/**
 * Listener for extension installation or updates.
 */
chrome.runtime.onInstalled.addListener(function(details) {
  console.log(`ConsoleCapture: Installed with details: ${JSON.stringify(details)}`);
  // Initialize any necessary state
});

/**
 * Listener for service worker suspension.
 */
chrome.runtime.onSuspend.addListener(function() {
  console.log('ConsoleCapture: Service worker suspended.');
});

/**
 * Handles events from the debugger API.
 * @param {Object} debuggeeId - The debuggee identifier.
 * @param {string} message - The event message.
 * @param {Object} params - Additional parameters for the event.
 */
function onEvent(debuggeeId, message, params) {
  const tabId = debuggeeId.tabId;
  if (!tabsInfo.has(tabId) || !tabsInfo.get(tabId).isCapturing) return;

  console.log(`Received debugger event on tab ${tabId}: ${message}`);

  let logEntry = null;

  try {
    if (message === "Log.entryAdded") {
      logEntry = formatLogEntry(params.entry);
    } else if (message === "Console.messageAdded") {
      logEntry = formatConsoleMessage(params.message);
    } else if (message === "Runtime.exceptionThrown") {
      const exception = params.exceptionDetails;
      logEntry = formatException(exception);
    }

    if (logEntry) {
      const currentLogs = tabsInfo.get(tabId).logs;
      currentLogs.push(logEntry);
      console.log(`Captured log on tab ${tabId}: ${logEntry.message}`);

      // Update persistent storage
      updatePersistentStorage(tabId, currentLogs);
    }
  } catch (error) {
    console.error(`Error processing debugger event on tab ${tabId}:`, error);
  }
}
