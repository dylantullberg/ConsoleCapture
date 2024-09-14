# ConsoleCapture

**ConsoleCapture** is a Chrome extension that allows developers and web enthusiasts to selectively capture and copy different types of console logs from web pages with a click. With the ability to filter and instantly copy to clipboard specific log types (such as `log`, `error`, `warn`, `info`, `debug`), this tool streamlines the debugging process. It also includes an optional auto-copy feature, ensuring that logs are copied as soon as a page loads. All captured data is stored locally, with no external sharing of information.

## Key Features:
- **Selective Console Log Capture**: Filter and capture specific types of logs (`log`, `error`, `warn`, `info`, `debug`) based on your needs.
- **Clipboard Integration**: Copy the selected logs directly to the clipboard with a single click.
- **Auto-Copy on Page Load**: Automatically copy logs to the clipboard when the page fully loads.
- **User Notifications**: Get visual feedback when logs are copied or if no logs are available.
- **Local Storage**: All captured logs are stored locally and are not transmitted to external servers.
- **Badge Reset on Stop**: Clear the log type counts (badges) automatically when capturing is stopped.

## Screenshots:
<img width="432" alt="image" src="https://github.com/user-attachments/assets/1ea4c8c8-c7ad-42e8-bb29-5b1c4b4b2469">


## Installation:
To install and test the extension locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/dylantullberg/ConsoleCapture.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer mode** by toggling the switch in the top-right corner.

4. Click **Load unpacked** and select the `ConsoleCapture` folder.

5. The extension is now installed and ready for use.

## How to Use:
1. Click on the ConsoleCapture icon in the Chrome toolbar to open the extension popup.
2. Select which types of logs (`log`, `error`, `warn`, `info`, `debug`) you want to capture.
3. Click **Start Capturing** to begin capturing logs.
4. Click **Stop Capturing** to stop and reset the log counts.
5. Use the copy buttons to selectively copy captured log types to the clipboard.

## Permissions:
ConsoleCapture requires the following permissions to function properly:
- **activeTab**: To access and capture logs from the currently active tab.
- **scripting**: To inject scripts that capture the logs from web pages.
- **storage**: To save user preferences and log data locally.
- **clipboardWrite**: To allow copying logs to the clipboard.
- **notifications**: To notify users about log capture or copy status.

## Privacy Policy:
ConsoleCapture operates entirely locally. All logs and user data are stored on your machine and are **never shared or transmitted** to external servers.

## License:
This project is licensed under the MIT License.

## Contribution:
Contributions are welcome! Feel free to fork the repository, submit pull requests, or open issues for any enhancements or bug fixes.

---

### Future Enhancements (Roadmap):
- Add options for inserting logs in page.

---

### Author:
- **Dylan Tullberg** GitHub: [https://github.com/dylantullberg](https://github.com/dylantullberg)
