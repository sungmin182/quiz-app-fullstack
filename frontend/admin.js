const API_URL = "https://quiz-app-fullstack-1.onrender.com/api/questions";
const questionsContainer = document.getElementById("questions-container");
const quizForm = document.getElementById("quiz-form");

// 문제 삭제 함수
async function deleteQuestion(id) {
  if (confirm("정말로 삭제하시겠습니까?")) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchAndDisplayQuestions();
  }
}

// 폼 제출 처리
quizForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = {
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("문제가 성공적으로 저장되었습니다!");
      quizForm.reset();
      fetchAndDisplayQuestions();
    } else {
      const error = await response.json();
      alert("저장 실패: " + error.error);
    }
  } catch (error) {
    alert("저장 중 오류가 발생했습니다: " + error.message);
  }
});

// 문제 목록을 불러와서 동적으로 표시하는 함수
async function fetchAndDisplayQuestions() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("문제 데이터를 불러오지 못했습니다.");
    }
    const questions = await response.json();
    questionsContainer.innerHTML = ""; // 기존 목록 초기화

    if (questions.length === 0) {
      questionsContainer.innerHTML = "<p>등록된 문제가 없습니다.</p>";
      return;
    }

    questions.forEach((q) => {
      const item = document.createElement("div");
      item.className = "question-item";
      item.innerHTML = `
                <p><strong>Q:</strong> ${q.question} (주제: ${q.topic}, 학년: ${q.gradeLevel})</p>
                <p><strong>정답:</strong> ${q.correctAnswer}</p>
                <button class="delete-btn" data-id="${q.id}">삭제</button>
            `;
      questionsContainer.appendChild(item);
    });

    // 삭제 버튼 이벤트 위임
    questionsContainer.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        deleteQuestion(id);
      });
    });
  } catch (err) {
    questionsContainer.innerHTML = `<p style="color:red;">오류: ${err.message}</p>`;
  }
}

// 페이지가 로드되면 바로 문제 목록을 불러온다
fetchAndDisplayQuestions();
