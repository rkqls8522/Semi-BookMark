chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 220,
    height: 150,
    focused: true,
  });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_manager") {
    chrome.windows.create({
      url: chrome.runtime.getURL("program.html"),
      type: "popup",
      width: 800,
      height: 600,
      focused: true,
    });
  }
});
