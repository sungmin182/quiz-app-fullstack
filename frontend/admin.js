const API_URL = "https://quiz-app-fullstack.onrender.com/api/questions"; // 본인 백엔드 주소
const form = document.getElementById("quiz-form");
const questionsContainer = document.getElementById("questions-container");

// 모든 문제를 불러와서 화면에 표시하는 함수
async function fetchAndDisplayQuestions() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      // HTTP 상태 코드가 200-299가 아닌 경우
      throw new Error(`서버 응답 오류: ${response.status}`);
    }
    const questions = await response.json();

    questionsContainer.innerHTML = ""; // 기존 목록 초기화
    if (questions.length === 0) {
      questionsContainer.innerHTML = "<p>저장된 문제가 없습니다.</p>";
    } else {
      questions.forEach((q) => {
        const questionElement = document.createElement("div");
        questionElement.className = "question-item";
        questionElement.innerHTML = `
                    <p><strong>Q (${q.id}):</strong> ${q.question} (주제: ${q.topic}, 학년: ${q.gradeLevel})</p>
                    <p><strong>정답:</strong> ${q.correctAnswer}</p>
                    <button onclick="deleteQuestion(${q.id})">삭제</button>
                `;
        questionsContainer.appendChild(questionElement);
      });
    }
  } catch (error) {
    console.error("문제 로딩 실패:", error);
    questionsContainer.innerHTML = `<p style="color: red;">오류: 문제 데이터를 불러오지 못했습니다. (${error.message})</p>`;
  }
}

// 문제 삭제 함수
async function deleteQuestion(id) {
  if (confirm(`정말로 ${id}번 문제를 삭제하시겠습니까?`)) {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }
      alert("문제가 삭제되었습니다.");
      fetchAndDisplayQuestions(); // 목록 새로고침
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(`오류: 문제를 삭제하지 못했습니다. (${error.message})`);
    }
  }
}

// 폼 제출 이벤트 처리 (새 문제 추가)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newQuestion = {
    topic: document.getElementById("topic").value,
    gradeLevel: document.getElementById("gradeLevel").value,
    question: document.getElementById("question").value,
    optionA: document.getElementById("optionA").value,
    optionB: document.getElementById("optionB").value,
    optionC: document.getElementById("optionC").value,
    optionD: document.getElementById("optionD").value,
    correctAnswer: document.getElementById("correctAnswer").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuestion),
    });

    if (!response.ok) {
      throw new Error(`서버 응답 오류: ${response.status}`);
    }

    alert("문제가 성공적으로 저장되었습니다.");
    form.reset(); // 폼 초기화
    fetchAndDisplayQuestions(); // 목록 새로고침
  } catch (error) {
    console.error("저장 실패:", error);
    alert(`저장 중 오류가 발생했습니다: ${error.message}`);
  }
});

// 페이지가 로드되면 바로 문제 목록을 불러옵니다.
fetchAndDisplayQuestions();
