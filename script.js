let quizData = {
  easy: [],
  medium: [],
  hard: [],
};

const url = "question.json";

// Function to load questions from JSON file
async function loadQuestions() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not okay: ${response.status}`);
    }
    quizData = await response.json();
    console.log("Quiz Data Loaded:", quizData); // Log loaded data
  } catch (error) {
    console.error("Error loading questions:", error);
  }
}

loadQuestions();

let currentQuestionIndex = 0;
let currentLevel = "easy";
let score = 0;
let timer;
let timeLeft = 50;
let quizEnded = false;

// Function to start the quiz for a given level
async function startQuiz(level) {
  if (!quizData[level] || quizData[level].length === 0) {
    console.error(`No data for the chosen level: ${level}`);
    return;
  }

  currentLevel = level;
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 20;
  quizEnded = false;

  document.getElementById("result").innerText = "";
  document.getElementById("leaderBoard").style.display = "none";
  document.getElementById("difficulty-container").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  document.getElementById("next-button").style.display = "inline-block";
  document.getElementById("question-count").style.display = "block";

  loadQuestion();
  startTimer();
}

// Function to load the current question and options
function loadQuestion() {
  if (quizEnded) return;

  const questionData = quizData[currentLevel][currentQuestionIndex];
  if (!questionData) {
    console.error(
      "No question data available for current index:",
      currentQuestionIndex
    );
    return;
  }

  document.getElementById("question").innerText = questionData.question;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";

  questionData.options.forEach((option) => {
    const button = document.createElement("button");
    button.classList.add("option-button");
    button.innerHTML = option;
    button.onclick = () => checkAnswer(option, button);
    optionsContainer.appendChild(button);
  });

  document.getElementById("next-button").disabled = true;

  const remainingQuestions =
    quizData[currentLevel].length - currentQuestionIndex - 1;
  document.getElementById(
    "question-count"
  ).innerText = `Remaining Questions: ${remainingQuestions}`;
}

// Function to check the selected answer
function checkAnswer(selectedOption, button) {
  if (quizEnded) return;

  const correctAnswer =
    quizData[currentLevel][currentQuestionIndex].correctAnswer;
  const optionButtons = document.querySelectorAll(".option-button");

  optionButtons.forEach((btn) => (btn.disabled = true));

  if (selectedOption === correctAnswer) {
    button.classList.add("correct");
    score++;
    triggerConfetti();
  } else {
    button.classList.add("incorrect");
    document
      .querySelector(`.option-button:not(.incorrect)`)
      .classList.add("correct");
  }

  document.getElementById("next-button").disabled = false;
}

// Function to go to the next question or show result if the end is reached
function nextQuestion() {
  if (quizEnded) return;
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData[currentLevel].length) {
    loadQuestion();
  } else {
    clearInterval(timer);
    showResult("quizCompleted");
  }
}

function showResult(reason) {
  quizEnded = true;
  let resultMessage;

  switch (reason) {
    case "timeOut":
      resultMessage = "Time's up! You couldn't finish in time.";
      break;
    case "quizCompleted":
      if (score >= quizData[currentLevel].length * 0.7) {
        resultMessage = `Congrats, you won! You scored ${score} out of ${quizData[currentLevel].length}`;
        triggerConfetti();
      } else {
        resultMessage = `Sorry, you lost! You scored ${score} out of ${quizData[currentLevel].length}`;
      }
      break;
    default:
      resultMessage = `Quiz over! You scored ${score} out of ${quizData[currentLevel].length}`;
      break;
  }

  document.getElementById("result").innerText = resultMessage;
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("leaderBoard").innerText = `Your Score: ${score}`;
  document.getElementById("result").style.display = "block";
  document.getElementById("leaderBoard").style.display = "block";
  document.getElementById("next-button").style.display = "none";
  document.getElementById("question-count").style.display = "none";
}

// Function to start the timer
function startTimer() {
  console.log("Timer started with", timeLeft, "seconds");

  if (timer) {
    clearInterval(timer);
  }

  timer = setInterval(() => {
    if (quizEnded) {
      clearInterval(timer);
      console.log("Timer stopped as quiz ended.");
      return;
    }

    timeLeft--;
    console.log("Time left:", timeLeft);

    const timeValueElement = document.getElementById("time-value");
    if (timeValueElement) {
      timeValueElement.innerText = timeLeft;
    } else {
      console.error("Element with ID 'time-value' not found!");
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      quizEnded = true;
      showResult("timeOut");
    }
  }, 1000);
}

document.getElementById("next-button").addEventListener("click", nextQuestion);

// Function to trigger confetti
function triggerConfetti() {
  confetti({
    particleCount: 100,
    angle: 90,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"],
  });
}

