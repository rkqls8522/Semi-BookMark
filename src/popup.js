document.getElementById("saveBtn").addEventListener("click", function () {
  // 가빈 : windowType은 일단 일일반 탭만 대상으로 함
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true, windowType: "normal" },
    function (tabs) {
      if (tabs && tabs.length > 0) {
        var tab = tabs[0];
        var now = new Date();
        var bookmark = {
          title: tab.title,
          url: tab.url,
          date: now.toLocaleString(),
          dateOnly: now.getMonth() + 1 + "월 " + now.getDate() + "일",
          timestamp: now.getTime(),
        };
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
          var bookmarks = result.bookmarks;
          bookmarks.unshift(bookmark);
          chrome.storage.local.set({ bookmarks: bookmarks }, function () {
            // 가빈 : "저장되었습니다!" 메시지를 중앙 상단에 1초간 보여준 후 창 자동 닫게 할 것임.
            var statusEl = document.getElementById("status");
            statusEl.style.display = "block";
            setTimeout(function () {
              window.close();
            }, 1000);
          });
        });
      } else {
        alert("탭 정보를 가져올 수 없습니다.");
      }
    }
  );
});

// "목록조회" 버튼 클릭 시, program.html을 새 프로그램창으로 열 것임
document.getElementById("listBtn").addEventListener("click", function () {
  chrome.windows.create({
    url: chrome.runtime.getURL("src/program.html"),
    type: "popup",
    width: 800,
    height: 600,
    focused: true,
  });
});
