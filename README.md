## 📝 Changelog

### [1.3] - 2024-04-27

#### Added
- **Additional Log Categories:**
  - **Deprecation Warnings:** Captures logs related to deprecated APIs or features.
  - **Network Errors:** Captures network-related errors such as failed resource loads.
  - **CORS Errors:** Captures Cross-Origin Resource Sharing (CORS) related errors.
  - **Security Warnings:** Captures security-related warnings like mixed content or Content Security Policy (CSP) violations.
  - **Exceptions:** Captures unhandled promise rejections and other exceptions.
- **Grouped Copy Buttons:**
  - **Copy All Errors:** Aggregates and copies all error-related logs (`ERROR`, `EXCEPTION`, `NETWORKERROR`, `CORSERROR`).
  - **Copy All Warnings:** Aggregates and copies all warning-related logs (`WARNING`, `DEPRECATIONWARNING`, `SECURITYWARNING`).
- **Sample Test HTML Page:**
  - A dedicated HTML page designed to generate various console logs for testing the extension's functionalities.

#### Fixed
- **Deprecation Warnings Capture:**
  - Enhanced the categorization logic to accurately identify and capture Deprecation Warnings.
- **Badge Counts Display:**
  - Resolved issues where badges for "Copy Debug," "Copy Info," and "Copy CORS Errors" were not displaying correctly.
- **CORS Errors Capture:**
  - Adjusted the test HTML and categorization logic to ensure CORS Errors are reliably captured.

#### Improved
- **Popup Interface:**
  - Reorganized the popup layout into three rows for better user experience:
    - **Row 1:** Original categories—Errors, Warnings, Logs, Info, Debug.
    - **Row 2:** Additional categories—Deprecation Warnings, Network Errors, CORS Errors, Security Warnings, Exceptions.
    - **Row 3:** Grouped copy buttons—Copy All Errors, Copy All Warnings.
- **Log Categorization Logic:**
  - Enhanced the logic to prevent overlapping categories and ensure each log is accurately categorized based on its content.

#### Updated
- **Manifest File:**
  - Bumped the extension version to `1.3`.
  - Updated permissions to include `clipboardWrite` and ensured all necessary host permissions are present.
- **README:**
  - Revised to include new features, updated installation and usage instructions, and added the sample test HTML section.

---

## 💬 Commit Message

```
chore: Update ConsoleCapture extension to version 1.3

- Added new log categories: Deprecation Warnings, Network Errors, CORS Errors, Security Warnings, Exceptions.
- Introduced grouped copy buttons: Copy All Errors and Copy All Warnings.
- Enhanced badge counts for all individual buttons to accurately reflect log counts.
- Fixed issues with Deprecation Warnings, Debug, Info, and CORS Errors not being captured or displayed correctly.
- Updated popup layout to three rows for better organization and user experience.
- Included a sample HTML test page to facilitate testing of various console logs.
- Updated manifest.json to include necessary permissions and bumped version to 1.3.
- Revised README to document new features, installation steps, usage instructions, and testing procedures.
```

---

## 📖 Revised README

# ConsoleCapture

**ConsoleCapture** is a Chrome extension that allows developers and web enthusiasts to selectively capture and copy different types of console logs from web pages with a click. With the ability to filter and instantly copy to clipboard specific log types (such as `log`, `error`, `warn`, `info`, `debug`, `deprecation warnings`, `network errors`, `CORS errors`, `security warnings`, and `exceptions`), this tool streamlines the debugging process. It also includes an optional auto-copy feature, ensuring that logs are copied as soon as a page loads. All captured data is stored locally, with no external sharing of information.

## 🔑 Key Features:
- **Selective Console Log Capture:** Filter and capture specific types of logs (`log`, `error`, `warn`, `info`, `debug`, `deprecation warnings`, `network errors`, `CORS errors`, `security warnings`, `exceptions`) based on your needs.
- **Grouped Copy Buttons:** 
  - **Copy All Errors:** Aggregate and copy all error-related logs (`ERROR`, `EXCEPTION`, `NETWORKERROR`, `CORSERROR`).
  - **Copy All Warnings:** Aggregate and copy all warning-related logs (`WARNING`, `DEPRECATIONWARNING`, `SECURITYWARNING`).
- **Clipboard Integration:** Copy the selected logs directly to the clipboard with a single click.
- **Auto-Copy on Page Load:** Automatically copy logs to the clipboard when the page fully loads.
- **User Notifications:** Get visual feedback when logs are copied or if no logs are available.
- **Badge Counts:** Each log category button displays a badge indicating the number of captured logs. Badges are conditionally shown only when there are entries.
- **Local Storage:** All captured logs are stored locally and are not transmitted to external servers.
- **Badge Reset on Stop:** Clear the log type counts (badges) automatically when capturing is stopped.

## 📸 Screenshots:
<img width="602" alt="image" src="https://github.com/user-attachments/assets/0e7c7aed-4469-4a05-9ac5-561e65e8b1a6">


## 📦 Installation:
To install and test the extension locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/dylantullberg/ConsoleCapture.git
   ```

2. **Open Chrome Extensions Page:**
   - Navigate to `chrome://extensions/` in your Chrome browser.

3. **Enable Developer Mode:**
   - Toggle the **Developer mode** switch in the top-right corner.

4. **Load Unpacked Extension:**
   - Click **Load unpacked** and select the `ConsoleCapture` folder from the cloned repository.

5. **Extension is Ready:**
   - The extension is now installed and ready for use.

## 🚀 How to Use:
1. **Open the Extension Popup:**
   - Click on the **ConsoleCapture** icon in the Chrome toolbar to open the extension popup.

2. **Start Capturing Logs:**
   - Click **Start Capturing** to begin capturing logs from the active tab.

3. **View Badge Counts:**
   - Each log category button displays a badge indicating the number of captured logs. Badges are visible only when counts are greater than zero.

4. **Copy Logs:**
   - **Individual Categories:**
     - Click on any individual log category button (e.g., Errors, Warnings, Logs, Info, Debug, Deprecation Warnings, Network Errors, CORS Errors, Security Warnings, Exceptions) to copy the respective logs to the clipboard in JSON format.
   - **Grouped Categories:**
     - Click **Copy All Errors** to copy all error-related logs.
     - Click **Copy All Warnings** to copy all warning-related logs.

5. **Stop Capturing Logs:**
   - Click **Stop Capturing** to stop capturing logs. Badge counts will reset automatically.

6. **View Captured Logs:**
   - The popup displays all captured logs in a scrollable section for quick reference.

## 🔧 Permissions:
ConsoleCapture requires the following permissions to function properly:
- **activeTab**: To access and capture logs from the currently active tab.
- **debugger**: To attach the debugger and capture logs via the Debugger API.
- **scripting**: To inject scripts that capture logs from web pages.
- **storage**: To save user preferences and log data locally.
- **clipboardWrite**: To allow copying logs to the clipboard.
- **notifications**: To notify users about log capture or copy status.

## 🛡️ Privacy Policy:
ConsoleCapture operates entirely locally. All logs and user data are stored on your machine and are **never shared or transmitted** to external servers.

## 📜 License:
This project is licensed under the MIT License.

## 🤝 Contribution:
Contributions are welcome! Feel free to fork the repository, submit pull requests, or open issues for any enhancements or bug fixes.

---

### 🚧 Future Enhancements (Roadmap):
- **Insert Logs into Page:** Add options for inserting logs directly into the webpage for real-time monitoring.
- **Filter Customization:** Allow users to create custom filters for log categories.
- **Export Logs:** Provide options to export logs in various formats (e.g., CSV, plain text).

---

### 📝 Sample Test HTML Page:

To facilitate testing of various console logs and ensure that **ConsoleCapture** functions as expected, use the following sample HTML page. This page intentionally triggers different types of console logs, including Deprecation Warnings, Network Errors, CORS Errors, Info, and Debug logs.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>ConsoleCapture Test Page</title>
  <script>
    // Triggering an Unhandled Rejection (will be grouped under Exceptions)
    new Promise((resolve, reject) => {
      reject('This is an unhandled rejection!');
    });

    // Triggering a Deprecation Warning
    console.warn('This API is deprecated and will be removed in future versions.');

    // Triggering a Network Error
    fetch('https://nonexistent.domain12345.com/resource')
      .then(response => response.json())
      .catch(error => console.error('Network Error:', error));

    // Triggering a CORS Error
    // Note: To reliably trigger a CORS error, fetch a resource from a different origin without proper CORS headers.
    // For demonstration, using an invalid endpoint. Replace with a suitable URL if needed.
    fetch('https://example.com/invalid-cors-endpoint')
      .then(response => response.json())
      .catch(error => console.error('CORS Error:', error));

    // Triggering a Security Warning (Mixed Content)
    const img = new Image();
    img.src = 'http://insecure-website.com/image.jpg'; // Loading from HTTP on an HTTPS page
    document.body.appendChild(img);

    // Triggering Info and Debug Logs
    console.info('This is an info log for testing.');
    console.debug('This is a debug log for testing.');
  </script>
</head>
<body>
  <h1>ConsoleCapture Test Page</h1>
  <p>This page is designed to generate specific console logs for testing the ConsoleCapture extension.</p>
</body>
</html>
```

**Explanation of Test Cases:**

1. **Unhandled Rejection:**
   - **Code:**
     ```javascript
     new Promise((resolve, reject) => {
       reject('This is an unhandled rejection!');
     });
     ```
   - **Expected Log:** Should be captured under the "Exceptions" category.

2. **Deprecation Warning:**
   - **Code:**
     ```javascript
     console.warn('This API is deprecated and will be removed in future versions.');
     ```
   - **Expected Log:** Should trigger a Deprecation Warning.

3. **Network Error:**
   - **Code:**
     ```javascript
     fetch('https://nonexistent.domain12345.com/resource')
       .then(response => response.json())
       .catch(error => console.error('Network Error:', error));
     ```
   - **Expected Log:** Should capture a Network Error due to an invalid domain.

4. **CORS Error:**
   - **Code:**
     ```javascript
     fetch('https://example.com/invalid-cors-endpoint')
       .then(response => response.json())
       .catch(error => console.error('CORS Error:', error));
     ```
   - **Expected Log:** Should capture a CORS Error because the endpoint lacks proper CORS headers.

   - **Note:** Replace `'https://example.com/invalid-cors-endpoint'` with a valid URL that does not support CORS if needed for more reliable testing.

5. **Security Warning (Mixed Content):**
   - **Code:**
     ```javascript
     const img = new Image();
     img.src = 'http://insecure-website.com/image.jpg'; // Loading from HTTP on an HTTPS page
     document.body.appendChild(img);
     ```
   - **Expected Log:** Should capture a Security Warning related to mixed content.

6. **Info and Debug Logs:**
   - **Code:**
     ```javascript
     console.info('This is an info log for testing.');
     console.debug('This is a debug log for testing.');
     ```
   - **Expected Logs:** Should be captured under the "Info" and "Debug" categories respectively.

---

### 📂 Final Directory Structure

Ensure your extension's directory structure includes all necessary files:

```
ConsoleCapture/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── content.js
├── styles.css
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── icons/
    └── material-icons.css
```

**Notes:**
- **Icons:**
  - Ensure that all icon files (`icon16.png`, `icon48.png`, `icon128.png`, and `material-icons.css`) are correctly placed in the `icons` directory.
- **File Paths:**
  - Verify that all file paths referenced in `manifest.json` and `popup.html` are accurate.

---

## 🔍 Testing the Extension

After implementing the above updates, follow these steps to ensure that your **ConsoleCapture** extension functions as expected:

1. **Load the Updated Extension:**
   - Navigate to `chrome://extensions/` in your Chrome browser.
   - Enable **Developer mode** using the toggle in the top right corner.
   - Click **Load unpacked** and select the `ConsoleCapture` folder.

2. **Use the Sample Test Page:**
   - Open a new tab and navigate to the provided test HTML page (`ConsoleCapture Test Page`).
   - The page will automatically generate various console logs, including unhandled promise rejections, deprecation warnings, network errors, CORS errors, security warnings, info logs, and debug logs.

3. **Start Capturing Logs:**
   - Click on the **ConsoleCapture** extension icon to open the popup.
   - Click **Start Capturing** to begin capturing logs.

4. **Verify Badge Counts:**
   - **Errors:**
     - Should include `"ERROR"`, `"EXCEPTION"`, `"NETWORKERROR"`, and `"CORSERROR"`.
   - **Warnings:**
     - Should include `"WARNING"`, `"DEPRECATIONWARNING"`, and `"SECURITYWARNING"`.
   - **Logs:**
     - Should include `"LOG"`.
   - **Info:**
     - Should include `"INFO"`.
   - **Debug:**
     - Should include `"DEBUG"`.
   - **Deprecation Warnings:**
     - Should include `"DEPRECATIONWARNING"`.
   - **Network Errors:**
     - Should include `"NETWORKERROR"`.
   - **CORS Errors:**
     - Should include `"CORSERROR"`.
   - **Security Warnings:**
     - Should include `"SECURITYWARNING"`.
   - **Exceptions:**
     - Should include `"EXCEPTION"`.

   - **Grouped Buttons:**
     - **Copy All Errors:** Should display the total of `"ERROR"`, `"EXCEPTION"`, `"NETWORKERROR"`, and `"CORSERROR"`.
     - **Copy All Warnings:** Should display the total of `"WARNING"`, `"DEPRECATIONWARNING"`, and `"SECURITYWARNING"`.

5. **Copy Logs:**
   - **Individual Buttons:**
     - Click each individual button (Errors, Warnings, Logs, Info, Debug, Deprecation Warnings, Network Errors, CORS Errors, Security Warnings, Exceptions) to copy their respective logs.
     - Paste the copied logs into a text editor to verify the JSON structure and content.
   - **Grouped Buttons:**
     - Click **Copy All Errors** and **Copy All Warnings** to copy aggregated logs.
     - Paste the copied logs into a text editor to verify the aggregated JSON structure and content.

6. **Verify Empty Logs:**
   - Ensure that buttons like "Copy Debug," "Copy Info," and "Copy CORS Errors" are populated correctly when corresponding logs are generated.
   - If certain buttons still appear empty:
     - **Deprecation Warnings:** Ensure the test page triggers them correctly with `console.warn`.
     - **CORS Errors:** Ensure that the fetch request is correctly configured to trigger a CORS error without using `mode: 'no-cors'`. Adjust the test page's CORS fetch as necessary.
     - **Debug and Info Logs:** Ensure that the test page includes `console.debug` and `console.info` statements.

7. **Stop Capturing Logs:**
   - Click **Stop Capturing** to stop capturing logs.
   - Verify that the badge counts reset and no new logs are captured until capturing is started again.

8. **Performance Check:**
   - Monitor the extension's performance, especially when handling a large volume of logs, to ensure it remains responsive.

---

## 🔒 Compliance and Permissions Considerations

Ensure that your extension adheres to Chrome's extension policies and manages permissions appropriately.

1. **Permissions Required:**
   - **`clipboardWrite`:** Necessary for the copy-to-clipboard functionality.
   - **`debugger`:** Required for attaching the debugger to capture logs via the Debugger API.
   - **`activeTab` and `host_permissions` (`<all_urls>`):** Allow the extension to access and capture logs from any webpage.
   - **`scripting` and `storage`:** Already included and necessary for capturing and managing logs.

2. **Handling Sensitive Data:**
   - **Privacy:** Ensure that the logs being captured do not inadvertently contain sensitive user information.
   - **Filtering:** Implement filters or allow users to exclude certain types of logs if needed.

3. **User Consent:**
   - **Transparency:** Inform users about the types of logs being captured and how they can manage or clear them.
   - **Control:** Provide options to start/stop capturing and to clear logs, giving users control over their data.

4. **Error Handling:**
   - **Graceful Failures:** Handle scenarios where permissions are denied or clipboard access fails, providing clear feedback to the user.

5. **Security:**
   - **Sanitization:** Ensure that any data copied to the clipboard is sanitized to prevent potential security vulnerabilities.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👤 Author

- **Dylan Tullberg**  
  GitHub: [https://github.com/dylantullberg](https://github.com/dylantullberg)
