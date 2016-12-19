import { initMobileDetect, isMobile } from './functions/mobileDetect';

(() => {
    'use strict';

    const DEBUG = false;

    const WORD_MIN_LENGTH = 7;
    const WORD_MAX_LENGTH = 12;
    const POSSIBLE_MISTAKES = 10;

    let wordToGuess = '';

    // input letters elements
    let letters = {};

    let isGameStartedOnInit = false;
    let isGameOver = false;
    let isGameWon = false;
    let isGameInProgress = false;

    const gameOver = () => {
        isGameOver = true;
        isGameInProgress = false;

        document.querySelector('.modal__game-subtitle').innerHTML += ' ' + wordToGuess;
        document.body.classList.add('is-game-over');
    };

    const gameWon = () => {
        isGameWon = true;
        isGameInProgress = false;

        document.body.classList.add('is-game-won');
    };

    const checkIfGameIsWon = () => {
        if (document.querySelectorAll('.input-letters__item-inner.is-visible').length === wordToGuess.length) {
            return true;
        }

        return false;
    };

    const showPartOfMan = (mistakeNumber = 0) => {
        if (mistakeNumber) {
            document
                .querySelector('[data-mistake="' + mistakeNumber + '"]')
                .classList.remove('is-hidden');

            if (mistakeNumber > POSSIBLE_MISTAKES) {
                gameOver();
            }
        }
    };

    /**
     * show letter while typing when is duplicated
     *
     * @param  {string} letter
     */
    const showDuplicateLetter = (letter) => {
        const duplicateLetterHld = document.querySelector('.duplicate-letter');
        const duplicateLetterItem = document.createElement('DIV');

        duplicateLetterItem.innerHTML = letter;
        duplicateLetterItem.classList.add('duplicate-letter__inner');

        duplicateLetterHld.appendChild(duplicateLetterItem);

        setTimeout(function() {
            duplicateLetterItem.classList.add('is-visible');

            setTimeout(function() {
                duplicateLetterItem.classList.add('is-hidden');

                setTimeout(function() {
                    duplicateLetterItem.remove();
                }, 300);
            }, 150);
        }, 0);
    };

    /**
     * show missed letter if we haven't added that letter yet
     *
     * @param  {string} letter
     */
    const showMissedLetter = (letter) => {
        const missedLettersHld = document.querySelector('.missed-info__letters');

        if (missedLettersHld.innerHTML.indexOf(letter) === -1) {
            missedLettersHld.innerHTML += letter;

            showPartOfMan(missedLettersHld.innerHTML.length);
        } else {
            showDuplicateLetter(letter);
        }
    };

    const addNewLetterToInputs = (letter) => {
        let onlyOneTimeShowInfo = false;

        wordToGuess.split('').reduce((arr, el, idx) => {
            const letterItem = letters[idx].querySelector('div');

            if (el === letter) {
                if (!letterItem.classList.contains('is-visible')) {
                    arr.push(idx);

                    letterItem.innerHTML = letter;
                    letterItem.classList.add('is-visible');
                } else if (!onlyOneTimeShowInfo) {
                    onlyOneTimeShowInfo = true;

                    showDuplicateLetter(letter);
                }
            }

            return arr;
        }, []);
    };

    const checkIfLetterIsCorrect = (letter) => {
        if (letter.length === 1 && isGameInProgress) {
            if (wordToGuess.indexOf(letter) === -1) {
                showMissedLetter(letter);
            } else {
                addNewLetterToInputs(letter);

                if (checkIfGameIsWon()) {
                    gameWon();
                }
            }
        }
    };

    const reInitGame = () => {
        isGameStartedOnInit = false;
        isGameOver = false;
        isGameWon = false;
        isGameInProgress = false;

        document.querySelector('.missed-info__letters').innerHTML = '';

        document.querySelector('.modal__game-subtitle').innerHTML = '';

        document.querySelectorAll('.input-letters__item').forEach((letter) => {
            letter.classList.add('is-disabled');

            letter.querySelector('div').innerHTML = '';
            letter.querySelector('div').classList.remove('is-visible');
        });

        document.querySelectorAll('[data-mistake]').forEach((partOfMan) => {
            partOfMan.classList.add('is-hidden');
        });

        initGame();
    };

    /**
     * attach events for desktop and mobile devices
     */
    const attachTypeAndClickEvents = () => {
        const checkIfGameIsStarted = () => {
            if (!isGameStartedOnInit) {
                isGameStartedOnInit = true;
                isGameInProgress = true;

                document.body.classList.add('is-game-started');
            }
        };

        if (isMobile) {
            document.querySelector('.mobile-input__inner').addEventListener('input', function() {
                const letter = this.value.substr(this.value.length - 1);

                checkIfGameIsStarted();

                checkIfLetterIsCorrect(letter);
            });
        } else {
            document.addEventListener('keypress', (e) => {
                const letter = e.key.trim();

                // when game is over or won
                // to play again type enter or space
                if (isGameOver || isGameWon) {
                    if (e.keyCode === 13 || e.keyCode === 32) {
                        reInitGame();
                    }
                }

                checkIfGameIsStarted();

                checkIfLetterIsCorrect(letter);
            });
        }

        document.querySelectorAll('.js-start-game').forEach((element) => {
            element.addEventListener('click', () => {
                reInitGame();
            });
        });
    };

    const loadJSON = (url, done) => {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                done(null, xhr.response);
            } else {
                done(xhr.response);
            }
        };
        xhr.onerror = () => {
            done(xhr.response);
        };
        xhr.send();
    };

    const prepareWordnikUrl = () => {
        let url = 'http://api.wordnik.com:80/v4/words.json/randomWord?';

        const params = {
            /* jshint camelcase: false */
            minLength: WORD_MIN_LENGTH,
            maxLength: WORD_MAX_LENGTH,
            api_key: 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
        };

        let paramsForUrl = '';
        paramsForUrl = Object.keys(params).map((k) => {
            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
        }).join('&');

        url += paramsForUrl;

        return url;
    };

    const initGame = (onlyOneTime = false) => {
        loadJSON(prepareWordnikUrl(), (err, data) => {
            if (onlyOneTime) {
                attachTypeAndClickEvents();

                document.body.classList.add('is-init');
            }

            if (err || typeof data === 'undefined') {
                document.querySelector('.modal__game-over-title').innerHTML = 'Something when wrong';
                document.querySelector('.modal__game-subtitle').innerHTML = '';

                document.body.classList.add('is-game-started', 'is-game-over');

                return false;
            }

            if (DEBUG) {
                console.log(JSON.parse(data));
            }

            wordToGuess = JSON.parse(data).word.toLowerCase();

            letters = [].slice
                .call(document.querySelectorAll('.input-letters__item'))
                .slice(WORD_MAX_LENGTH - wordToGuess.length, WORD_MAX_LENGTH);

            letters.forEach((letter) => {
                letter.classList.remove('is-disabled');
            });

            document.body.classList.remove('is-game-over', 'is-game-won');
        });
    };

    initMobileDetect();

    initGame(true);
})();
