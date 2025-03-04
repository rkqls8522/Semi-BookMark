// 가빈 : 북마크 목록을 날짜별로 그룹화하여 렌더링할 것임.
function renderGroupedBookmarks(bookmarks) {
  var groups = {};
  bookmarks.forEach(function (bm) {
    if (!groups[bm.dateOnly]) {
      groups[bm.dateOnly] = [];
    }
    groups[bm.dateOnly].push(bm);
  });
  // 최신 순으로 그룹 정렬 (각 그룹 내 최대 타임스탬프 기준)
  var groupKeys = Object.keys(groups).sort(function (a, b) {
    var tA = Math.max.apply(
      null,
      groups[a].map(function (bm) {
        return bm.timestamp;
      })
    );
    var tB = Math.max.apply(
      null,
      groups[b].map(function (bm) {
        return bm.timestamp;
      })
    );
    return tB - tA;
  });

  var listDiv = document.getElementById("bookmarkList");
  listDiv.innerHTML = "";

  groupKeys.forEach(function (key) {
    var header = document.createElement("h3");
    header.textContent = key;
    listDiv.appendChild(header);

    groups[key].sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });
    groups[key].forEach(function (bm) {
      var div = document.createElement("div");
      div.className = "bookmark";

      // 체크박스: 각 항목에 data-timestamp 속성 부여
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "bookmarkCheckbox";
      checkbox.setAttribute("data-timestamp", bm.timestamp);

      // 링크: 제목 클릭 시 새 탭에서 사이트 열림
      var link = document.createElement("a");
      link.href = bm.url;
      link.target = "_blank";
      link.textContent = bm.title;

      // 날짜/시간 정보 표시
      var timeElem = document.createElement("small");
      timeElem.textContent = bm.date;

      div.appendChild(checkbox);
      div.appendChild(link);
      div.appendChild(timeElem);
      listDiv.appendChild(div);
    });
  });
}

// 저장된 북마크 불러오기 및 (검색어 필터 후) 렌더링
// 한 글자 한 글자 누를 때마다 작동할 것임.
function displayBookmarks() {
  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    var bookmarks = result.bookmarks;
    var query = document.getElementById("searchInput").value.toLowerCase();
    if (query) {
      bookmarks = bookmarks.filter(function (bm) {
        return (
          bm.title.toLowerCase().includes(query) ||
          bm.url.toLowerCase().includes(query)
        );
      });
    }
    renderGroupedBookmarks(bookmarks);
  });
}

// 내보내기: 저장된 북마크 데이터를 JSON 파일로 다운로드
document.getElementById("exportBtn").addEventListener("click", function () {
  chrome.storage.local.get({ bookmarks: [] }, function (result) {
    var dataStr = JSON.stringify(result.bookmarks, null, 2);
    var blob = new Blob([dataStr], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

// 가져오기: 파일 선택 창 열기
document.getElementById("importBtn").addEventListener("click", function () {
  document.getElementById("fileInput").click();
});
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var importedBookmarks = JSON.parse(e.target.result);
        if (!Array.isArray(importedBookmarks)) {
          alert("잘못된 파일 형식입니다.");
          return;
        }
        // 기존 북마크와 가져온 북마크를 합쳐서 저장
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
          var existingBookmarks = result.bookmarks;
          // 두 배열을 이어붙임 (importedBookmarks를 앞쪽에 추가)
          var combinedBookmarks = importedBookmarks.concat(existingBookmarks);
          chrome.storage.local.set(
            { bookmarks: combinedBookmarks },
            function () {
              displayBookmarks();
            }
          );
        });
      } catch (error) {
        alert("파일 읽기 중 에러가 발생했습니다.");
      }
    };
    reader.readAsText(file);
  });

// 전체 삭제: 모든 북마크 삭제
document.getElementById("deleteAllBtn").addEventListener("click", function () {
  if (confirm("모든 북마크를 삭제하시겠습니까?")) {
    chrome.storage.local.set({ bookmarks: [] }, function () {
      displayBookmarks();
    });
  }
});

// 선택 삭제: 체크된 항목만 삭제 (체크박스의 data-timestamp 기준)
document
  .getElementById("deleteSelectedBtn")
  .addEventListener("click", function () {
    chrome.storage.local.get({ bookmarks: [] }, function (result) {
      var bookmarks = result.bookmarks;
      var checkboxes = document.querySelectorAll(".bookmarkCheckbox:checked");
      var timestampsToDelete = Array.from(checkboxes).map(function (cb) {
        return Number(cb.getAttribute("data-timestamp"));
      });
      var updatedBookmarks = bookmarks.filter(function (bm) {
        return !timestampsToDelete.includes(bm.timestamp);
      });
      chrome.storage.local.set({ bookmarks: updatedBookmarks }, function () {
        displayBookmarks();
      });
    });
  });

// 전체 선택 체크박스: 모든 체크박스 선택/해제
document.getElementById("selectAll").addEventListener("change", function () {
  var checkboxes = document.querySelectorAll(".bookmarkCheckbox");
  checkboxes.forEach(function (cb) {
    cb.checked = document.getElementById("selectAll").checked;
  });
});

// 검색 입력창 변화 시 북마크 목록 업데이트
document.getElementById("searchInput").addEventListener("input", function () {
  displayBookmarks();
});

// x 아이콘 클릭 시 검색 입력창 초기화
document.getElementById("clearSearch").addEventListener("click", function () {
  document.getElementById("searchInput").value = "";
  displayBookmarks();
});

// 페이지 로드 시 북마크 목록 표시
document.addEventListener("DOMContentLoaded", function () {
  displayBookmarks();
});
