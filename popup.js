// popup.js

let currentTabId = null;

// Define grouped copy options
const groupedCopyOptions = {
  copyAllErrors: ["ERROR", "EXCEPTION", "NETWORKERROR", "CORSERROR"],
  copyAllWarnings: ["WARNING", "DEPRECATIONWARNING", "SECURITYWARNING"]
};

// Debounce function to limit the rate of function execution
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // Attach event listener to the toggle capture button
  const toggleCaptureButton = document.getElementById('toggleCapture');
  if (toggleCaptureButton) {
    toggleCaptureButton.addEventListener('click', toggleCapture);
  }

  // Attach event listeners to all icon buttons
  const iconButtonIds = [
    'btnErrors',
    'btnWarnings',
    'btnLogs',
    'btnInfo',
    'btnDebug',
    'btnDeprecationWarnings',
    'btnNetworkErrors',
    'btnCORSErrors',
    'btnSecurityWarnings',
    'btnExceptions',
    'btnCopyAllErrors',
    'btnCopyAllWarnings'
  ];

  iconButtonIds.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      switch (id) {
        case 'btnErrors':
          button.addEventListener('click', () => copyFilteredLogs(['ERROR', 'EXCEPTION', 'NETWORKERROR', 'CORSERROR'], 'Errors'));
          break;
        case 'btnWarnings':
          button.addEventListener('click', () => copyFilteredLogs(['WARNING', 'DEPRECATIONWARNING', 'SECURITYWARNING'], 'Warnings'));
          break;
        case 'btnLogs':
          button.addEventListener('click', () => copyFilteredLogs(['LOG'], 'Logs'));
          break;
        case 'btnInfo':
          button.addEventListener('click', () => copyFilteredLogs(['INFO'], 'Info'));
          break;
        case 'btnDebug':
          button.addEventListener('click', () => copyFilteredLogs(['DEBUG'], 'Debug'));
          break;
        case 'btnDeprecationWarnings':
          button.addEventListener('click', () => copyFilteredLogs(['DEPRECATIONWARNING'], 'Deprecation Warnings'));
          break;
        case 'btnNetworkErrors':
          button.addEventListener('click', () => copyFilteredLogs(['NETWORKERROR'], 'Network Errors'));
          break;
        case 'btnCORSErrors':
          button.addEventListener('click', () => copyFilteredLogs(['CORSERROR'], 'CORS Errors'));
          break;
        case 'btnSecurityWarnings':
          button.addEventListener('click', () => copyFilteredLogs(['SECURITYWARNING'], 'Security Warnings'));
          break;
        case 'btnExceptions':
          button.addEventListener('click', () => copyFilteredLogs(['EXCEPTION'], 'Exceptions'));
          break;
        case 'btnCopyAllErrors':
          button.addEventListener('click', () => copyGroupedLogs('copyAllErrors', 'All Errors'));
          break;
        case 'btnCopyAllWarnings':
          button.addEventListener('click', () => copyGroupedLogs('copyAllWarnings', 'All Warnings'));
          break;
        default:
          break;
      }
    }
  });

  // Get the current active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs.length === 0) {
      console.error('No active tabs found.');
      return;
    }
    currentTabId = tabs[0].id;
    console.log(`Popup detected active tab: ${currentTabId}`);
    chrome.runtime.sendMessage({action: 'getStatus', tabId: currentTabId}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error querying status:', chrome.runtime.lastError.message);
        showNotification('Failed to retrieve capturing status.');
        return;
      }
      if (response.isCapturing) {
        const toggleLabel = document.getElementById('toggleCaptureLabel');
        const captureButton = document.getElementById('toggleCapture');
        if (toggleLabel && captureButton) {
          toggleLabel.textContent = 'Stop Capturing';
          captureButton.classList.remove('btn-start');
          captureButton.classList.add('btn-stop');
        }
      }
      updateLogsDisplay();
    });
  });

  // Listen for messages from background.js to display notifications
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Popup received message:', request);
    if (request.action === 'logsCleared') {
      console.log('Popup clearing logs display.');
      updateLogsDisplay();
    }
    if (request.action === 'displayNotification') {
      showNotification(request.message);
    }
  });
});

function toggleCapture() {
  console.log('Toggle Capture button clicked.');
  chrome.runtime.sendMessage({action: 'toggleCapture', tabId: currentTabId}, function(response) {
    console.log(`Received response from toggleCapture: ${JSON.stringify(response)}`);
    const buttonLabel = document.getElementById('toggleCaptureLabel');
    const captureButton = document.getElementById('toggleCapture');

    if (response.isCapturing) {
      if (buttonLabel && captureButton) {
        buttonLabel.textContent = 'Stop Capturing';
        captureButton.classList.remove('btn-start');
        captureButton.classList.add('btn-stop');
      }
      showNotification('Capturing logs...');
    } else {
      if (buttonLabel && captureButton) {
        buttonLabel.textContent = 'Start Capturing';
        captureButton.classList.remove('btn-stop');
        captureButton.classList.add('btn-start');
      }
      showNotification('Stopped capturing logs.');

      // Reset the badge counts when stopping capture
      resetBadgeCounts();

      // Clear the logs display
      chrome.runtime.sendMessage({action: 'clearLogs', tabId: currentTabId}, function() {
        updateLogsDisplay();
      });
    }
    updateLogsDisplay();
  });
}

function resetBadgeCounts() {
  const badgeIds = [
    'countErrors',
    'countWarnings',
    'countLogs',
    'countInfo',
    'countDebug',
    'countDeprecationWarnings',
    'countNetworkErrors',
    'countCORSErrors',
    'countSecurityWarnings',
    'countExceptions',
    'countCopyAllErrors',
    'countCopyAllWarnings'
  ];

  badgeIds.forEach(id => {
    const badge = document.getElementById(id);
    if (badge) {
      badge.textContent = 0;
      toggleBadgeDisplay(id, 0);
    }
  });
}

const updateLogsDisplay = debounce(function() {
  console.log('Updating logs display in popup.');
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    const logsElement = document.getElementById('logs');
    if (!logsElement) {
      console.error('Logs element not found in popup.');
      return;
    }
    logsElement.textContent = '';
    if (response.logs) {
      const allLogs = response.logs.map(log => log.message);
      logsElement.textContent = allLogs.join('\n');
      logsElement.scrollTop = logsElement.scrollHeight;
      updateLogCounts(response.logs);
    }
  });
}, 300); // Debounce with 300ms delay

function updateLogCounts(logs) {
  const counts = {
    'ERROR': 0,
    'WARNING': 0,
    'LOG': 0,
    'INFO': 0,
    'DEBUG': 0,
    'DEPRECATIONWARNING': 0,
    'NETWORKERROR': 0,
    'CORSERROR': 0,
    'SECURITYWARNING': 0,
    'EXCEPTION': 0
  };

  logs.forEach(log => {
    const level = log.level.toUpperCase();
    if (counts.hasOwnProperty(level)) {
      counts[level]++;
    }
  });

  // Update individual counts
  const countMappings = {
    'countErrors': counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR'],
    'countWarnings': counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING'],
    'countLogs': counts['LOG'],
    'countInfo': counts['INFO'],
    'countDebug': counts['DEBUG'],
    'countDeprecationWarnings': counts['DEPRECATIONWARNING'],
    'countNetworkErrors': counts['NETWORKERROR'],
    'countCORSErrors': counts['CORSERROR'],
    'countSecurityWarnings': counts['SECURITYWARNING'],
    'countExceptions': counts['EXCEPTION'],
    'countCopyAllErrors': counts['ERROR'] + counts['EXCEPTION'] + counts['NETWORKERROR'] + counts['CORSERROR'],
    'countCopyAllWarnings': counts['WARNING'] + counts['DEPRECATIONWARNING'] + counts['SECURITYWARNING']
  };

  for (const [id, count] of Object.entries(countMappings)) {
    const badge = document.getElementById(id);
    if (badge) {
      badge.textContent = count;
      toggleBadgeDisplay(id, count);
    }
  }
}

function toggleBadgeDisplay(badgeId, count) {
  const badge = document.getElementById(badgeId);
  if (badge) {
    if (count > 0) {
      badge.classList.add('show');
      badge.textContent = count;
    } else {
      badge.classList.remove('show');
      badge.textContent = 0;
    }
  }
}

function copyFilteredLogs(levels, categoryName) {
  console.log(`Copying filtered logs for category: ${categoryName}`);
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    console.log('Received logs for copying:', response.logs);
    if (response.logs && response.logs.length > 0) {
      const filteredLogs = response.logs.filter(log => levels.includes(log.level.toUpperCase()));
      if (filteredLogs.length === 0) {
        showNotification(`No ${categoryName} to copy.`);
        return;
      }
      // Structure the logs into categorized JSON
      const categorizedLogs = {
        [categoryName]: filteredLogs.map(log => ({
          timestamp: log.timestamp,
          message: log.message
        }))
      };
      const jsonOutput = JSON.stringify(categorizedLogs, null, 2);
      navigator.clipboard.writeText(jsonOutput).then(() => {
        showNotification(`${categoryName} copied to clipboard!`);
      }).catch((err) => {
        showNotification('Failed to copy logs: ' + err);
      });
    } else {
      showNotification('No logs to copy.');
    }
  });
}

function copyGroupedLogs(groupName, displayName) {
  console.log(`Copying grouped logs for: ${displayName}`);
  if (!groupedCopyOptions[groupName]) {
    showNotification('Invalid copy option.');
    return;
  }

  const levels = groupedCopyOptions[groupName];
  
  chrome.runtime.sendMessage({action: 'getLogs', tabId: currentTabId}, function(response) {
    console.log('Received logs for grouped copying:', response.logs);
    if (response.logs && response.logs.length > 0) {
      const filteredLogs = response.logs.filter(log => levels.includes(log.level.toUpperCase()));
      if (filteredLogs.length === 0) {
        showNotification(`No logs found for ${displayName}.`);
        return;
      }

      // Structure the logs into categorized JSON
      const categorizedLogs = {
        [displayName]: filteredLogs.map(log => ({
          timestamp: log.timestamp,
          level: log.level,
          message: log.message
        }))
      };

      const jsonOutput = JSON.stringify(categorizedLogs, null, 2);
      navigator.clipboard.writeText(jsonOutput).then(() => {
        showNotification(`${displayName} copied to clipboard!`);
      }).catch((err) => {
        showNotification('Failed to copy logs: ' + err);
      });
    } else {
      showNotification('No logs to copy.');
    }
  });
}

function showNotification(message) {
  console.log(`Showing notification: ${message}`);
  const notification = document.getElementById('notification');
  if (!notification) {
    console.error('Notification element not found in popup.');
    return;
  }
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
    console.log(`Notification hidden: ${message}`);
  }, 2000);
}
