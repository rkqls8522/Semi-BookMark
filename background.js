// background.js
// chrome.commands API를 통해 등록된 명령어를 감지합니다.
chrome.commands.onCommand.addListener((command) => {
  if (command === "open_manager") {
    // 단축키가 눌리면 program.html을 별도 창으로 엽니다.
    chrome.windows.create({
      url: chrome.runtime.getURL("program.html"),
      type: "popup", // 일반 브라우저 창과 달리 팝업 형태로 엽니다.
      width: 800, // 원하는 창의 너비
      height: 600, // 원하는 창의 높이
    });
  }
});
