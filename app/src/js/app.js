import { initMobileDetect, isMobile } from './functions/mobileDetect';

(function() {
    'use strict';

    let wordToGuess = '';
    let letters = [];
    let wordToGuessLength = 0;
    const wordMinLength = 7;
    const wordMaxLength = 12;
    const possibleMistakes = 11; // count man parts :)
    let isGameStarted = false;
    let isGameOver = false;
    let isGameWon = false;
    let isGameInProgress = false;

    const DEBUG = true;

    const reinitGame = function () {
        isGameStarted = false;
        isGameOver = false;
        isGameWon = false;
        isGameInProgress = false;

        document.querySelector('.missed-info__letters').innerHTML = '';

        document.querySelectorAll('.input-letters__item').forEach(function(letter) {
            letter.classList.add('is-disabled');

            letter.querySelector('div').innerHTML = '';
            letter.querySelector('div').classList.remove('is-visible');
        });


        document.querySelectorAll('[data-mistake]').forEach(function(partOfMan) {
            partOfMan.classList.add('is-hidden');
        });

        document.body.classList.remove('is-game-over', 'is-game-won');

        initGame();
    };

    const gameOver = function () {
        isGameOver = true;
        isGameInProgress = false;

        document.querySelector('.modal__game-subtitle').innerHTML += ' ' + wordToGuess;

        document.body.classList.add('is-game-over');
    };

    const gameWon = function () {
        isGameWon = true;
        isGameInProgress = false;

        document.body.classList.add('is-game-won');
    };

    const checkIfGameIsWon = function () {
        if (document.querySelectorAll('.input-letters__item-inner.is-visible').length === letters.length) {
            return true;
        }

        return false;
    };

    const showingMan = (mistakeNumber = 0) => {
        if (mistakeNumber) {
            if (mistakeNumber <= possibleMistakes) {
                document
                    .querySelector('[data-mistake="' + mistakeNumber + '"]')
                    .classList.remove('is-hidden');
            } else {
                gameOver();
            }
        }
    };

    const showMissedLetter = function (letter = '') {
        if (letter) {
            const missedLettersHld = document.querySelector('.missed-info__letters');

            if (missedLettersHld.innerHTML.indexOf(letter) === -1) {
                missedLettersHld.innerHTML += letter;

                showingMan(missedLettersHld.innerHTML.length);
            } else {
                //FIXME: add nice modal info
                console.log('letter is already in missed letters');
            }
        }
    };

    const checkIfLetterIsCorrect = function (letter = '') {
        if (letter.length === 1 && isGameInProgress) {
            if (wordToGuess.indexOf(letter) === -1) {
                showMissedLetter(letter);
            } else {
                wordToGuess.split('').reduce(function (arr, el, idx) {
                    if (el === letter) {
                        arr.push(idx);

                        letters[idx].querySelector('div').innerHTML = letter;
                        letters[idx].querySelector('div').classList.add('is-visible');
                    }

                    return arr;
                }, []);

                if (checkIfGameIsWon()) {
                    gameWon();
                }
            }
        }

        return false;
    };

    const listenForTyping = function () {
        const globalListenForTyping = function (letter = '') {
            if (!isGameStarted) {
                isGameStarted = true;
                isGameInProgress = true;

                document.body.classList.add('is-game-started');
            }

            checkIfLetterIsCorrect(letter);
        };

        if (isMobile) {
            document.querySelector('.mobile-input__inner').addEventListener('input', function(e) {
                const letter = this.value.substr(this.value.length - 1);

                globalListenForTyping(letter);
            });
        } else {
            document.addEventListener('keypress', function(e) {
                const letter = e.key.trim();

                globalListenForTyping(letter);
            });
        }

        document.querySelectorAll('.js-start-game').forEach(function (element) {
            element.addEventListener('click', function(e) {
                reinitGame();
            });
        });
    };

    const loadJSON = function (url) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200 && xhr.responseText) {
                    if (DEBUG) {
                        console.log(JSON.parse(xhr.responseText));
                    }

                    wordToGuess = JSON.parse(xhr.responseText).word.toLowerCase();
                } else {
                    //FIXME
                    if (DEBUG) {
                        console.log('sth went wrong, add info to refresh window');
                    }
                }
            }
        };
        xhr.open('GET', url, true);
        xhr.send();
    };

    const prepareWordnikUrl = function () {
        let url = 'http://api.wordnik.com:80/v4/words.json/randomWord?';

        const params = {
            minLength: wordMinLength,
            maxLength: wordMaxLength,
            api_key: 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
        };

        let paramsForUrl = '';
        paramsForUrl = Object.keys(params).map(function(k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
        }).join('&');

        url += paramsForUrl;

        return url;
    };


    const initGame = function (onlyOneTime = false) {
        loadJSON(prepareWordnikUrl());

        //FIXME: temporary -> add promise if loaded JSON then init game
        setTimeout(function() {
            document.body.classList.add('is-init');

            wordToGuessLength = wordToGuess.length;

            letters = [].slice
                .call(document.querySelectorAll('.input-letters__item'))
                .slice(wordMaxLength - wordToGuessLength, wordMaxLength);

            letters.forEach(function(letter) {
                letter.classList.remove('is-disabled');
            });

            if (onlyOneTime) {
                listenForTyping();
            }
        }, 1000);
    };

    //FIXME: start

    initMobileDetect();

    initGame(true);
})();
