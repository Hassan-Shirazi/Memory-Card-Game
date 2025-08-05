        const gameBoard = document.getElementById('game-board');
        const movesCountSpan = document.getElementById('moves-count');
        const timeTakenSpan = document.getElementById('time-taken');
        const startGameBtn = document.getElementById('startGameBtn');
        const difficultySelect = document.getElementById('difficulty');
        
        const gameOverModal = document.getElementById('gameOverModal');
        const finalMovesSpan = document.getElementById('final-moves');
        const finalTimeSpan = document.getElementById('final-time');
        const playAgainBtn = document.getElementById('playAgainBtn');

        // Emojis for cards. Ensure enough unique ones for largest grid.
        const cardEmojis = ['😀', '😂', '😍', '🥳', '🤩', '😎', '😇', '😜', '🤑', '🥰', '😈', '👻', '👽', '🤖', '👾', '🚀', '🌟', '💡', '🎉', '🎈', '🎁', '👑', '💎', '💖', '💯'];

        const difficulties = {
            easy: { rows: 2, cols: 3, numPairs: 3 },    // 6 cards
            medium: { rows: 4, cols: 4, numPairs: 8 },  // 16 cards
            hard: { rows: 4, cols: 5, numPairs: 10 },   // 20 cards
            expert: { rows: 5, cols: 6, numPairs: 15 }  // 30 cards
        };

        let firstCard = null;
        let secondCard = null;
        let lockBoard = false; // Prevents clicking more than 2 cards
        let moves = 0;
        let matchedPairs = 0;
        let timerInterval;
        let seconds = 0;
        let currentDifficultyConfig;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
            }
            return array;
        }

        function createBoard() {
            gameBoard.innerHTML = ''; // Clear previous board
            moves = 0;
            matchedPairs = 0;
            seconds = 0;
            firstCard = null;
            secondCard = null;
            lockBoard = false;
            updateStatsDisplay();
            stopTimer();
            startTimer();

            currentDifficultyConfig = difficulties[difficultySelect.value];
            const { rows, cols, numPairs } = currentDifficultyConfig;

            gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            gameBoard.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            // Adjust card size for larger grids if necessary, or ensure parent container can scroll
            const cardWidth = Math.min(80, (gameBoard.clientWidth / cols) - 10); // -10 for gap
            const cardHeight = Math.min(100, (gameBoard.clientHeight / rows) - 10);


            let symbolsToUse = cardEmojis.slice(0, numPairs);
            let cardValues = shuffleArray([...symbolsToUse, ...symbolsToUse]);

            cardValues.forEach(value => {
                const card = document.createElement('div');
                card.classList.add('card');
                card.dataset.value = value;

                // Card front (hidden part)
                const cardFront = document.createElement('div');
                cardFront.classList.add('card-face', 'card-front');
                
                // Card back (visible symbol)
                const cardBack = document.createElement('div');
                cardBack.classList.add('card-face', 'card-back');
                cardBack.textContent = value;

                card.appendChild(cardFront);
                card.appendChild(cardBack);
                
                // Adjust card size dynamically (optional, can be fixed in CSS too)
                card.style.width = `${cardWidth}px`;
                card.style.height = `${cardHeight}px`;


                card.addEventListener('click', flipCard);
                gameBoard.appendChild(card);
            });
        }

        function flipCard() {
            if (lockBoard) return;
            if (this === firstCard) return; // Clicked the same card twice

            this.classList.add('flipped');

            if (!firstCard) {
                firstCard = this;
                return;
            }

            secondCard = this;
            moves++;
            updateStatsDisplay();
            checkForMatch();
        }

        function checkForMatch() {
            lockBoard = true; // Lock board while checking
            let isMatch = firstCard.dataset.value === secondCard.dataset.value;

            if (isMatch) {
                disableCards();
            } else {
                unflipCards();
            }
        }

        function disableCards() {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            
            // No need to remove 'flipped' if 'matched' also applies transform
            // firstCard.removeEventListener('click', flipCard); // Already handled by 'matched' class or lockBoard
            // secondCard.removeEventListener('click', flipCard);

            matchedPairs++;
            resetTurn();
            if (matchedPairs === currentDifficultyConfig.numPairs) {
                gameOver();
            }
        }

        function unflipCards() {
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetTurn();
            }, 1000); // Show cards for 1 second before flipping back
        }

        function resetTurn() {
            [firstCard, secondCard] = [null, null];
            lockBoard = false;
        }

        function updateStatsDisplay() {
            movesCountSpan.textContent = moves;
            timeTakenSpan.textContent = `${seconds}s`;
        }
        
        function startTimer() {
            if (timerInterval) clearInterval(timerInterval); // Clear existing timer
            seconds = 0; // Reset seconds
            updateStatsDisplay(); // Update display to 0s immediately
            timerInterval = setInterval(() => {
                seconds++;
                updateStatsDisplay();
            }, 1000);
        }

        function stopTimer() {
            clearInterval(timerInterval);
        }
        
        function gameOver() {
            stopTimer();
            finalMovesSpan.textContent = moves;
            finalTimeSpan.textContent = `${seconds}s`;
            gameOverModal.style.display = 'flex';
        }

        startGameBtn.addEventListener('click', createBoard);
        playAgainBtn.addEventListener('click', () => {
            gameOverModal.style.display = 'none';
            createBoard(); // Restart with current difficulty
        });
        
        // Initial setup on page load (optional, or wait for button click)
        // createBoard(); 
        // Better to let user pick difficulty and click "Start Game"