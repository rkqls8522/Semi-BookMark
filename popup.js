// popup.js
// "저장" 버튼 클릭 시 현재 탭의 정보를 저장하는 기능 구현

document.getElementById("saveBtn").addEventListener("click", async () => {
  // 현재 활성 탭 정보를 가져오기 (비동기 처리)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    // 저장할 북마크 객체 생성: 제목, URL, 현재 날짜/시간 포함
    let bookmark = {
      title: tab.title, // 탭의 제목
      url: tab.url, // 탭의 URL
      date: new Date().toLocaleString(), // 현재 날짜 및 시간 (사용자 로컬 형식)
    };
    // chrome.storage.local에서 기존 북마크 배열을 가져옵니다 (기본값은 빈 배열)
    chrome.storage.local.get({ bookmarks: [] }, (result) => {
      let bookmarks = result.bookmarks;
      // 최신 북마크가 목록의 앞쪽에 오도록 배열 앞에 추가
      bookmarks.unshift(bookmark);
      // 업데이트된 북마크 배열을 다시 저장합니다.
      chrome.storage.local.set({ bookmarks }, () => {
        // 저장 완료 후 콘솔에 로그 남김 (필요에 따라 사용자에게 알림도 가능)
        console.log("Bookmark saved!");
      });
    });
  }
});
