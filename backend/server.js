// Node.js, Express, SQLite를 사용한 퀴즈 문제 관리 REST API 서버

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

let db;

// 초기 데이터 (CSV 파일의 내용을 기반으로)
const initialQuestions = [
  // 환경 - 저학년
  {
    topic: "Environment",
    gradeLevel: "low",
    question: "지구를 지키는 가장 좋은 방법은?",
    optionA: "분리수거를 한다",
    optionB: "물을 낭비한다",
    optionC: "쓰레기를 버린다",
    optionD: "전기를 켜둔다",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "low",
    question: "재활용이란 무엇인가요?",
    optionA: "다시 사용하는 것",
    optionB: "버리는 것",
    optionC: "태우는 것",
    optionD: "묻는 것",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "low",
    question: "자연을 보호하는 방법이 아닌 것은?",
    optionA: "나무를 심는다",
    optionB: "쓰레기를 버린다",
    optionC: "분리수거를 한다",
    optionD: "물을 아낀다",
    correctAnswer: "B",
  },
  {
    topic: "Environment",
    gradeLevel: "low",
    question: "지구 온난화를 막는 방법은?",
    optionA: "대중교통을 이용한다",
    optionB: "자동차를 많이 탄다",
    optionC: "전기를 많이 쓴다",
    optionD: "물을 낭비한다",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "low",
    question: "환경 친화적인 행동은?",
    optionA: "장바구니를 사용한다",
    optionB: "비닐봉투를 많이 쓴다",
    optionC: "일회용품을 쓴다",
    optionD: "쓰레기를 버린다",
    correctAnswer: "A",
  },

  // 환경 - 고학년
  {
    topic: "Environment",
    gradeLevel: "high",
    question: "지속가능한 발전이란?",
    optionA: "미래 세대를 위해 자원을 아끼는 것",
    optionB: "지금 당장 편하게 사는 것",
    optionC: "자원을 마구 쓰는 것",
    optionD: "환경을 파괴하는 것",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "high",
    question: "탄소 발자국을 줄이는 방법은?",
    optionA: "걸어서 이동한다",
    optionB: "자동차를 많이 탄다",
    optionC: "비행기를 탄다",
    optionD: "에어컨을 많이 쓴다",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "high",
    question: "생태계 보전의 중요성은?",
    optionA: "생물 다양성 유지",
    optionB: "자원 고갈",
    optionC: "환경 오염",
    optionD: "기후 변화",
    correctAnswer: "A",
  },
  {
    topic: "Environment",
    gradeLevel: "high",
    question: "친환경 에너지가 아닌 것은?",
    optionA: "태양광",
    optionB: "석탄",
    optionC: "풍력",
    optionD: "수력",
    correctAnswer: "B",
  },
  {
    topic: "Environment",
    gradeLevel: "high",
    question: "환경 보호를 위한 국제 협약은?",
    optionA: "파리협정",
    optionB: "무역협정",
    optionC: "군사협정",
    optionD: "문화협정",
    correctAnswer: "A",
  },

  // 문해력 - 저학년
  {
    topic: "Literacy",
    gradeLevel: "low",
    question: "글을 읽고 이해하는 능력을 무엇이라고 하나요?",
    optionA: "문해력",
    optionB: "운동능력",
    optionC: "음악능력",
    optionD: "요리능력",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "low",
    question: "책을 읽을 때 가장 중요한 것은?",
    optionA: "이해하기",
    optionB: "빨리 읽기",
    optionC: "소리내기",
    optionD: "그림보기",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "low",
    question: "글의 뜻을 파악하는 능력은?",
    optionA: "독해력",
    optionB: "운동력",
    optionC: "음악력",
    optionD: "요리력",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "low",
    question: "문장을 이해하는 능력이 부족하면?",
    optionA: "의사소통이 어려워진다",
    optionB: "운동을 못한다",
    optionC: "노래를 못한다",
    optionD: "요리를 못한다",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "low",
    question: "글을 읽고 내용을 파악하는 것은?",
    optionA: "독서",
    optionB: "운동",
    optionC: "음악",
    optionD: "요리",
    correctAnswer: "A",
  },

  // 문해력 - 고학년
  {
    topic: "Literacy",
    gradeLevel: "high",
    question: "문해력이 사회에 미치는 영향은?",
    optionA: "정보 접근성 향상",
    optionB: "운동 능력 향상",
    optionC: "음악 감각 향상",
    optionD: "요리 실력 향상",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "high",
    question: "디지털 시대의 문해력은?",
    optionA: "디지털 리터러시",
    optionB: "운동 리터러시",
    optionC: "음악 리터러시",
    optionD: "요리 리터러시",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "high",
    question: "정보를 비판적으로 읽는 능력은?",
    optionA: "비판적 사고",
    optionB: "운동 사고",
    optionC: "음악 사고",
    optionD: "요리 사고",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "high",
    question: "다양한 매체의 정보를 이해하는 능력은?",
    optionA: "미디어 리터러시",
    optionB: "운동 리터러시",
    optionC: "음악 리터러시",
    optionD: "요리 리터러시",
    correctAnswer: "A",
  },
  {
    topic: "Literacy",
    gradeLevel: "high",
    question: "문해력 향상을 위한 가장 좋은 방법은?",
    optionA: "독서",
    optionB: "운동",
    optionC: "음악감상",
    optionD: "요리",
    correctAnswer: "A",
  },

  // 디지털 - 저학년
  {
    topic: "Digital",
    gradeLevel: "low",
    question: "컴퓨터의 기본 부품이 아닌 것은?",
    optionA: "CPU",
    optionB: "메모리",
    optionC: "마우스",
    optionD: "냉장고",
    correctAnswer: "D",
  },
  {
    topic: "Digital",
    gradeLevel: "low",
    question: "인터넷을 안전하게 사용하는 방법은?",
    optionA: "개인정보를 보호한다",
    optionB: "모르는 사람과 만난다",
    optionC: "비밀번호를 공유한다",
    optionD: "의심스러운 링크를 클릭한다",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "low",
    question: "스마트폰을 올바르게 사용하는 방법은?",
    optionA: "시간을 정해 사용한다",
    optionB: "하루 종일 사용한다",
    optionC: "잠잘 때도 사용한다",
    optionD: "식사할 때도 사용한다",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "low",
    question: "디지털 기기를 사용할 때 주의할 점은?",
    optionA: "건강에 좋지 않다",
    optionB: "운동이 부족해진다",
    optionC: "음악을 못 듣는다",
    optionD: "요리를 못한다",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "low",
    question: "컴퓨터를 사용할 때 올바른 자세는?",
    optionA: "바른 자세로 앉는다",
    optionB: "구부정하게 앉는다",
    optionC: "눈을 가까이 한다",
    optionD: "장시간 앉는다",
    correctAnswer: "A",
  },

  // 디지털 - 고학년
  {
    topic: "Digital",
    gradeLevel: "high",
    question: "인공지능(AI)이란?",
    optionA: "컴퓨터가 사람처럼 생각하는 기술",
    optionB: "운동하는 기술",
    optionC: "음악을 만드는 기술",
    optionD: "요리를 하는 기술",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "high",
    question: "빅데이터의 의미는?",
    optionA: "대용량 데이터",
    optionB: "작은 데이터",
    optionC: "운동 데이터",
    optionD: "음악 데이터",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "high",
    question: "사이버 보안이 중요한 이유는?",
    optionA: "개인정보 보호",
    optionB: "운동 보호",
    optionC: "음악 보호",
    optionD: "요리 보호",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "high",
    question: "블록체인 기술의 특징은?",
    optionA: "분산 저장",
    optionB: "중앙 집중",
    optionC: "운동 집중",
    optionD: "음악 집중",
    correctAnswer: "A",
  },
  {
    topic: "Digital",
    gradeLevel: "high",
    question: "클라우드 컴퓨팅의 장점은?",
    optionA: "언제 어디서나 접근 가능",
    optionB: "운동만 가능",
    optionC: "음악만 가능",
    optionD: "요리만 가능",
    correctAnswer: "A",
  },
];

// 데이터베이스 연결 및 테이블 생성
(async () => {
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

  // 초기 데이터 삽입 (테이블이 비어있을 때만)
  const count = await db.get("SELECT COUNT(*) as count FROM questions");
  if (count.count === 0) {
    console.log("초기 데이터 삽입 중...");
    for (const question of initialQuestions) {
      await db.run(
        "INSERT INTO questions (topic, gradeLevel, question, optionA, optionB, optionC, optionD, correctAnswer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          question.topic,
          question.gradeLevel,
          question.question,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.correctAnswer,
        ]
      );
    }
    console.log("초기 데이터 삽입 완료");
  }

  console.log("데이터베이스 연결 및 테이블 준비 완료");
})();

// 모든 문제 가져오기 (GET)
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await db.all("SELECT * FROM questions");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "문제 목록을 불러오는 중 오류 발생" });
  }
});

// 새 문제 추가 (POST)
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
    if (
      !topic ||
      !gradeLevel ||
      !question ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctAnswer
    ) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }
    const result = await db.run(
      "INSERT INTO questions (topic, gradeLevel, question, optionA, optionB, optionC, optionD, correctAnswer) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
    res.status(201).json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: "문제 추가 중 오류 발생" });
  }
});

// 문제 삭제 (DELETE)
app.delete("/api/questions/:id", async (req, res) => {
  try {
    await db.run("DELETE FROM questions WHERE id = ?", req.params.id);
    res.json({ message: "문제가 성공적으로 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({ error: "문제 삭제 중 오류 발생" });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`퀴즈 API 서버가 http://localhost:${PORT} 에서 실행 중`);
});
