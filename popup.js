// 현재 탭의 정보를 가져와 북마크를 저장하는 기능을 처리하는 이벤트 리스너 등록
document.getElementById("saveBtn").addEventListener("click", async () => {
  // 현재 활성 탭 정보를 가져오기 (chrome.tabs.query는 promise를 반환하므로 async/await 사용)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // 탭 정보가 존재하는지 확인
  if (tab) {
    // 저장할 북마크 객체 생성: 탭의 제목, URL, 현재 날짜 및 시각
    let bookmark = {
      title: tab.title, // 탭의 제목
      url: tab.url, // 탭의 URL
      date: new Date().toLocaleString(), // 현재 날짜 및 시간 (사용자 지역 형식)
    };

    // chrome.storage.local에서 기존의 북마크 데이터를 가져옴 (기본값은 빈 배열)
    chrome.storage.local.get({ bookmarks: [] }, (result) => {
      let bookmarks = result.bookmarks; // 기존 저장된 북마크 배열
      bookmarks.unshift(bookmark); // 새로운 북마크를 배열의 맨 앞에 추가 (최신순 정렬)

      // 업데이트된 북마크 배열을 chrome.storage.local에 저장
      chrome.storage.local.set({ bookmarks }, () => {
        // 저장 후 목록을 다시 출력하여 업데이트된 데이터를 화면에 반영
        displayBookmarks();
      });
    });
  }
});

// 내보내기(Export) 기능 처리
document.getElementById("exportBtn").addEventListener("click", () => {
  // chrome.storage.local에서 북마크 데이터를 가져옴
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    let bookmarks = result.bookmarks; // 가져온 북마크 배열
    // 북마크 배열을 JSON 문자열로 변환 (파일로 저장할 데이터)
    let dataStr = JSON.stringify(bookmarks, null, 2); // 보기 좋게 들여쓰기도 적용
    // JSON 문자열을 Blob 객체로 생성 (데이터를 파일 형태로 저장하기 위함)
    let blob = new Blob([dataStr], { type: "application/json" });
    // Blob 객체의 URL을 생성
    let url = URL.createObjectURL(blob);

    // 임시로 a 태그를 만들어 파일 다운로드를 트리거
    let a = document.createElement("a");
    a.href = url; // a 태그의 href 속성에 Blob URL 할당
    a.download = "bookmarks_backup.json"; // 다운로드 받을 파일명 지정
    a.click(); // a 태그 클릭 이벤트를 강제로 발생시켜 다운로드 시작

    // 다운로드 후 Blob URL 해제 (메모리 누수 방지)
    URL.revokeObjectURL(url);
  });
});

// 가져오기(Import) 기능: 가져오기 버튼 클릭 시 숨겨진 파일 입력 요소를 클릭시킴
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click(); // 파일 선택 창을 엽니다.
});

// 파일 입력 요소에 변화가 있을 때(사용자가 파일을 선택했을 때) 처리하는 이벤트 리스너
document.getElementById("fileInput").addEventListener("change", (event) => {
  let file = event.target.files[0]; // 선택한 첫 번째 파일 가져오기
  if (!file) return; // 파일이 없으면 함수 종료

  // FileReader 객체를 생성하여 파일 내용을 읽음
  let reader = new FileReader();
  // 파일 읽기가 완료되었을 때 실행될 이벤트 핸들러
  reader.onload = (e) => {
    try {
      // 읽은 텍스트 데이터를 JSON으로 파싱하여 북마크 배열로 변환
      let importedBookmarks = JSON.parse(e.target.result);

      // 가져온 데이터가 배열인지 확인 (데이터 형식 검증)
      if (!Array.isArray(importedBookmarks)) {
        alert("잘못된 파일 형식입니다."); // 올바른 형식이 아니면 사용자에게 경고
        return;
      }

      // chrome.storage.local에 가져온 북마크 데이터를 저장
      chrome.storage.local.set({ bookmarks: importedBookmarks }, () => {
        // 저장 후 화면에 변경된 북마크 목록 출력
        displayBookmarks();
      });
    } catch (error) {
      // JSON 파싱 에러 발생 시 사용자에게 알림
      alert("파일 읽기 중 에러가 발생했습니다.");
    }
  };
  // 파일 읽기 시작 (텍스트 형식으로 읽음)
  reader.readAsText(file);
});
// 검색 입력 필드에서 입력된 값을 기반으로 북마크 목록 필터링
document.getElementById("searchInput").addEventListener("input", function () {
  let query = this.value.toLowerCase(); // 입력값 소문자화
  chrome.storage.local.get({ bookmarks: [] }, (result) => {
    let bookmarks = result.bookmarks;
    let filtered = bookmarks.filter(
      (bm) =>
        bm.title.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query)
    );
    displayBookmarks(filtered);
  });
});

// displayBookmarks 함수를 약간 수정하여 배열을 인자로 받을 수 있게 함
function displayBookmarks(bookmarks = null) {
  if (!bookmarks) {
    chrome.storage.local.get({ bookmarks: [] }, (result) => {
      bookmarks = result.bookmarks;
      renderBookmarks(bookmarks);
    });
  } else {
    renderBookmarks(bookmarks);
  }
}

function renderBookmarks(bookmarks) {
  let listDiv = document.getElementById("bookmarkList");
  listDiv.innerHTML = "";
  bookmarks.forEach((bm) => {
    let div = document.createElement("div");
    div.className = "bookmark";
    div.innerHTML = `<a href="${bm.url}" target="_blank">${bm.title}</a><br><small>${bm.date}</small>`;
    listDiv.appendChild(div);
  });
}

// 팝업이 로드될 때 저장된 북마크 목록을 바로 출력하도록 설정
document.addEventListener("DOMContentLoaded", displayBookmarks);
