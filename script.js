// Define the API 
const CATEGORIES_API_URL = 'https://the-trivia-api.com/api/categories';
const QUESTIONS_API_URL = 'https://the-trivia-api.com/api/questions?categories=';

// DOM Elements
const categoryDropdown = document.getElementById('category');
const startButton = document.getElementById('start-game');
const gameSetup = document.getElementById('game-setup');
const gameArea = document.getElementById('game-area');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextQuestionButton = document.getElementById('next-question');
const player1NameDisplay = document.getElementById('player1-name');
const player2NameDisplay = document.getElementById('player2-name');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');

let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let currentQuestionIndex = 0;
let questions = [];
let selectedCategories = []; // Track selected categories

// Fetch and populate categories into dropdown
async function fetchCategories() {
    try {
        const response = await fetch(CATEGORIES_API_URL);
        const categories = await response.json();
        populateCategoryDropdown(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function populateCategoryDropdown(categories) {
    const categoryKeys = Object.keys(categories);
    categoryKeys.forEach(category => {
        if (!selectedCategories.includes(category.toLowerCase())) { // Exclude previously selected categories
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category.replace(/\_/g, ' ');
            categoryDropdown.appendChild(option);
        }
    });
}

startButton.addEventListener('click', function (event) {
    event.preventDefault();

    // Fetch selected category from dropdown
    const category = categoryDropdown.value;

    // Add selected category to the list
    selectedCategories.push(category);

    // Fetch questions for the chosen category
    fetchQuestions(category);

    // Start the game
    startGame();
});

// Fetch questions from the selected category
async function fetchQuestions(category) {
    try {
        const easyResponse = await fetch(`${QUESTIONS_API_URL}${category}&limit=2&difficulty=easy`);
        const mediumResponse = await fetch(`${QUESTIONS_API_URL}${category}&limit=2&difficulty=medium`);
        const hardResponse = await fetch(`${QUESTIONS_API_URL}${category}&limit=2&difficulty=hard`);

        // Combine all questions into one array
        const easyQuestions = await easyResponse.json();
        const mediumQuestions = await mediumResponse.json();
        const hardQuestions = await hardResponse.json();

        // Combine questions and assign to global variable
        questions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

        startGame(); // Start the game only after questions are fetched
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}

// Start the game and show the first question
function startGame() {
    if (questions.length === 0) {
        console.error('No questions fetched!');
        return;
    }

    gameSetup.style.display = 'none';
    gameArea.style.display = 'block';

    const player1Name = document.getElementById('Player1').value;
    const player2Name = document.getElementById('Player2').value;

    player1NameDisplay.innerText = player1Name;
    player2NameDisplay.innerText = player2Name;

    showNextQuestion(); // Now, questions are available to display
}

// Shuffle function to randomize answers
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Show the next question
function showNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        askPostQuestionOptions(); // Show options for the next action
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;

    // Set the difficulty level
    const difficultyElement = document.getElementById('difficulty');
    difficultyElement.textContent = `Difficulty: ${currentQuestion.difficulty}`;

    answersElement.innerHTML = ''; // Clear previous answers

    // Combine the correct answer with incorrect ones and shuffle
    const allAnswers = [currentQuestion.correctAnswer, ...currentQuestion.incorrectAnswers];
    shuffle(allAnswers); // Shuffle the answers

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.onclick = () => checkAnswer(currentQuestion.correctAnswer, answer);
        answersElement.appendChild(button);
    });
}

// Check the answer and update scores
function checkAnswer(correctAnswer, selectedAnswer) {
    const allAnswerButtons = answersElement.querySelectorAll('button');

    // Highlight the selected answer
    allAnswerButtons.forEach(button => {
        if (button.textContent === selectedAnswer) {
            button.style.backgroundColor = selectedAnswer === correctAnswer ? '#4CAF50' : '#f44336'; // Green for correct, Red for incorrect
        } else if (button.textContent === correctAnswer) {
            button.style.backgroundColor = '#4CAF50'; // Green for correct answer if selected answer is wrong
        }
        button.disabled = true; // Disable all buttons after answering
    });

    // Update scores if the answer is correct
    if (correctAnswer === selectedAnswer) {
        if (currentPlayer === 1) {
            player1Score += getScoreForCurrentQuestion();
            player1ScoreDisplay.textContent = player1Score;
        } else {
            player2Score += getScoreForCurrentQuestion();
            player2ScoreDisplay.textContent = player2Score;
        }
    }

    // Switch players and prepare for the next question
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentQuestionIndex++;
    nextQuestionButton.style.display = 'block'; // Show the "Next Question" button
}

// Get the score for the current question
function getScoreForCurrentQuestion() {
    if (currentQuestionIndex < 2) return 10; // Easy question
    if (currentQuestionIndex < 4) return 15; // Medium question
    return 20; // Hard question
}

// Show post-question options
function askPostQuestionOptions() {
    const postOptions = confirm("All questions have been answered! Would you like to select another category? Click OK for Yes or Cancel to end the game.");

    if (postOptions) {
        resetForNewCategory(); // Reset for the new category selection
    } else {
        showWinner(); // Show the winner when the game ends
    }
}

// Reset for a new category selection
function resetForNewCategory() {
    currentQuestionIndex = 0; // Reset question index
    questions = []; // Clear questions
    gameArea.style.display = 'none'; // Hide the game area
    categoryDropdown.innerHTML = ''; // Clear category dropdown
    selectedCategories.forEach(() => {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Select';
        categoryDropdown.appendChild(option);
    });
    fetchCategories(); // Repopulate categories
    gameSetup.style.display = 'block'; // Show the game setup
}

// Show the winner and final scores
function showWinner() {
    const winnerMessage = document.getElementById('winner-message');
    const winnerTitle = winnerMessage.querySelector('.winner-title');

    if (player1Score > player2Score) {
        winnerTitle.textContent = `🎉 Player 1, ${player1NameDisplay.innerText} wins with a score of ${player1Score}! Well played, ${player2NameDisplay.innerText}! Your score is ${player2Score}. Great game! 🎉`;
    } else if (player2Score > player1Score) {
        winnerTitle.textContent = `🎉 Player 2, ${player2NameDisplay.innerText} wins with a score of ${player2Score}! Well played, ${player1NameDisplay.innerText}! Your score is ${player1Score}. Great game! 🎉`;
    } else {
        winnerTitle.textContent = `It's a tie! Both players scored ${player1Score}.`;
    }

    winnerMessage.style.display = 'block'; // Show the winner message
    gameArea.style.display = 'none';
}

nextQuestionButton.addEventListener('click', function () {
    showNextQuestion();
    nextQuestionButton.style.display = 'none'; // Hide "Next Question" button until clicked again
});

// Fetch categories when the page loads
window.addEventListener('DOMContentLoaded', fetchCategories);