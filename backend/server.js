const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// --- 미들웨어 설정 ---
app.use(
  cors({
    origin: "https://quiz-app-fullstack.onrender.com", // 프론트엔드 주소 수정
  })
);
app.use(express.json());

let db;

// --- 데이터베이스 연결 및 테이블 생성 ---
(async () => {
  try {
    db = await open({
      filename: "./database.db",
      driver: sqlite3.Database,
    });

    await db.exec(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                gradeLevel TEXT NOT NULL,
                question TEXT NOT NULL,
                optionA TEXT NOT NULL,
                optionB TEXT NOT NULL,
                optionC TEXT NOT NULL,
                optionD TEXT NOT NULL,
                correctAnswer TEXT NOT NULL
            )
        `);
    console.log("Database connected and table is ready.");
  } catch (err) {
    console.error("Database connection error:", err);
  }
})();

// --- API 엔드포인트 ---

// 서버 상태 확인용 기본 경로
app.get("/", (req, res) => {
  res.send("퀴즈 앱 백엔드 서버가 정상적으로 실행 중입니다.");
});

// 모든 문제 가져오기
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await db.all("SELECT * FROM questions ORDER BY id DESC");
    res.json(questions);
  } catch (err) {
    console.error("Failed to fetch questions:", err);
    res
      .status(500)
      .json({ error: "서버에서 문제 목록을 가져오는 데 실패했습니다." });
  }
});

// 새로운 문제 추가하기
app.post("/api/questions", async (req, res) => {
  try {
    const {
      topic,
      gradeLevel,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
    } = req.body;

    // SQL 쿼리에 매개변수 추가
    const result = await db.run(
      "INSERT INTO questions (topic, gradeLevel, question, optionA, optionB, optionC, optionD, correctAnswer) VALUES (?,?,?,?,?,?,?,?)",
      [
        topic,
        gradeLevel,
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
      ]
    );

    const newQuestion = await db.get("SELECT * FROM questions WHERE id = ?", [
      result.lastID,
    ]);
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error("Failed to add question:", err);
    res.status(500).json({ error: "서버에 문제를 추가하는 데 실패했습니다." });
  }
});

// 문제 삭제하기
app.delete("/api/questions/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM questions WHERE id = ?", [req.params.id]);
    res.json({ message: "문제가 성공적으로 삭제되었습니다." });
  } catch (err) {
    console.error("Failed to delete question:", err);
    res
      .status(500)
      .json({ error: "서버에서 문제를 삭제하는 데 실패했습니다." });
  }
});

// --- 서버 시작 ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
