// program.js

// 북마크 목록을 화면에 렌더링하는 함수
function renderBookmarks(bookmarks) {
  let listDiv = document.getElementById("bookmarkList");
  listDiv.innerHTML = ""; // 기존 내용을 초기화
  // 각 북마크 항목마다 처리
  bookmarks.forEach((bm) => {
    // 각 항목을 div로 생성하고 스타일 지정
    let div = document.createElement("div");
    div.className = "bookmark";
    // 제목을 링크로 만들어 클릭 시 새 탭에서 해당 사이트를 엽니다.
    div.innerHTML = `<a href="${bm.url}" target="_blank">${bm.title}</a><br><small>${bm.date}</small>`;
    listDiv.appendChild(div);
  });
}

// chrome.storage.local에서 북마크 데이터를 가져와 화면에 표시하는 함수
function displayBookmarks() {
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    renderBookmarks(result.bookmarks);
  });
}

// 검색 입력 필드에서 사용자가 입력할 때 북마크 목록을 필터링
document.getElementById("searchInput").addEventListener("input", function () {
  let query = this.value.toLowerCase();
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    // 제목이나 URL에 검색어가 포함된 북마크만 필터링
    let filtered = result.bookmarks.filter(
      (bm) =>
        bm.title.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query)
    );
    renderBookmarks(filtered);
  });
});

// 내보내기 버튼: 북마크 데이터를 JSON 파일로 다운로드
document.getElementById("exportBtn").addEventListener("click", () => {
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    let dataStr = JSON.stringify(result.bookmarks, null, 2); // 보기 좋게 포맷팅
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks_backup.json"; // 다운로드 파일명
    a.click();
    URL.revokeObjectURL(url); // 메모리 누수 방지
  });
});

// 가져오기 버튼: 파일 선택 창 열기
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// 파일 입력 요소에서 파일이 선택되면 북마크 데이터를 가져와 저장
document.getElementById("fileInput").addEventListener("change", (event) => {
  let file = event.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    try {
      let importedBookmarks = JSON.parse(e.target.result);
      // 가져온 데이터가 배열 형식인지 검증
      if (!Array.isArray(importedBookmarks)) {
        alert("잘못된 파일 형식입니다.");
        return;
      }
      chrome.storage.local.set({ bookmarks: importedBookmarks }, () => {
        displayBookmarks();
      });
    } catch (error) {
      alert("파일 읽기 중 에러가 발생했습니다.");
    }
  };
  reader.readAsText(file);
});

// 전체 삭제 버튼: 모든 저장된 북마크를 삭제
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if (confirm("모든 북마크를 삭제하시겠습니까?")) {
    chrome.storage.local.set({ bookmarks: [] }, () => {
      displayBookmarks();
    });
  }
});

// 페이지가 로드될 때 저장된 북마크를 표시
document.addEventListener("DOMContentLoaded", displayBookmarks);
