let grayArr = [];
let greenArr = [];
let yellowArr = [];

async function getWords() {
    let words = await fetch('five-letter-words.json');
    words = await words.json();
    let wordArr = [];
    for (word of words) {
        wordArr.push(word.word.toLowerCase());
    };
    for (item of greenArr) {
        let position = item.position;
        position = Number(position.substring(position.length - 1));

        wordArr = wordArr.filter(word => word.substring(position - 1, position) == item.letter);
    };
    for (item of yellowArr) {
        let position = item.position;
        position = Number(position.substring(position.length - 1));

        wordArr = wordArr.filter(word => word.substring(position - 1, position) != item.letter);
        wordArr = wordArr.filter(word => word.includes(item.letter));
    };
    for (item of grayArr) {
        wordArr = wordArr.filter(word => !word.includes(item))
    };
    $('#displayList').append(wordArr.map(word => `<li>${word}</li>`).join(''));
};

enableGuessRows();

function enableGuessRows() {
    $(`.guess input`).attr('disabled', false);
    $('.guess').removeClass('disabled');

    let guessCount = Number($('.countPicked').text());
    for (let i = guessCount + 1; i <= 6; i++) {
        $(`.guess${i} input`).attr('disabled', 'disabled');
        $(`.guess${i} input`).val('').removeClass('green yellow gray');
        $(`.guess${i}`).addClass('disabled');
    };

    for (let i = 1; i <= guessCount; i++) {
        for (let j = 1; j <= 5; j++) {
            if ($(`.guess${i} .letter${j} input`).val() == '') {
                $(`.guess${i} .letter${j} input`).focus();
                i = guessCount + 1;
                break;
            };
        };
    };
};

$('.guessCount').on('click', function (e) {
    $('.guessCount').removeClass('countPicked');
    $(e.target).addClass('countPicked');
    enableGuessRows();
});

$('.color-select').on('click', function (e) {
    if (!$(e.target).closest('.guess').hasClass('disabled')) {
        let guess = $(e.target).closest('.guess');
        guess = guess[0].classList[1];

        let letter = $(e.target).closest('.letter');
        letter = letter[0].classList[1];

        let inputBox = $(`.${guess}>.${letter} input`);

        if ($(inputBox).hasClass('gray')) {
            $(inputBox).addClass('green').removeClass('gray');
        } else if ($(inputBox).hasClass('green')) {
            $(inputBox).addClass('yellow').removeClass('green');
        } else {
            $(inputBox).addClass('gray').removeClass('yellow');
        };
    };
});

$('#generate').on('click', function () {
    greenArr = [];
    yellowArr = [];
    grayArr = [];
    $('#errorMsg').text('');
    $('#displayList').empty();

    checkInputs();
    if ($('#errorMsg').text() == '') {
        getWords();
    };
});

function checkInputs() {
    let guessCount = Number($('.countPicked').text());
    for (let i = 1; i <= guessCount; i++) {
        let word = $(`.guess${i} input`)
        for (letter of word) {
            if (letter.value == '') {
                $('#errorMsg').text('Missing inputs.');
                return;
            };
            if (!$(letter).hasClass('green') && !$(letter).hasClass('yellow') && !$(letter).hasClass('gray')) {
                $('#errorMsg').text('Missing inputs.');
                return;
            };
            if ($(letter).hasClass('green')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                if (greenArr.some(item => item.position == position && item.letter != letter.value)) {
                    $('#errorMsg').text('Check conflicting inputs.');
                    return;
                } else if (greenArr.some(item => item.position == position)) {
                    return;
                } else {
                    greenArr.push({ 'letter': letter.value.toLowerCase(), position });
                };
            };
            if ($(letter).hasClass('yellow')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                if (yellowArr.some(item => item.position == position && item.letter == letter.value)) {
                    return;
                } else {
                    yellowArr.push({ 'letter': letter.value.toLowerCase(), position });
                };
            };
            if ($(letter).hasClass('gray')) {
                grayArr.push(letter.value.toLowerCase());
            };
        };
    };
};

$(window).on('keyup', function (e) {
    let parentLetter = $(e.target).closest('.letter');
    let parentGuess = $(e.target).closest('.guess');
    if (e.which >= 65 && e.which <= 90) {
        if (parentLetter[0].nextElementSibling) {
            let nextLetter = parentLetter[0].nextElementSibling;
            $(nextLetter).children('input').focus().select();
        } else {
            let nextGuess = parentGuess[0].nextElementSibling;
            if ($(nextGuess).hasClass('guess') && !$(nextGuess).hasClass('disabled')) {
                $(nextGuess).find('.letter1 input').focus().select();
            };
        };
    } else if (e.which == 8) {
        if (parentLetter[0].previousElementSibling) {
            let prevLetter = parentLetter[0].previousElementSibling;
            $(prevLetter).children('input').focus().select();
        } else {
            if (parentGuess[0].previousElementSibling) {
                let prevGuess = parentGuess[0].previousElementSibling;
                if ($(prevGuess).hasClass('guess')) {
                    $(prevGuess).find('.letter5 input').focus().select();
                };
            };
        };
    };
});

$('input').on('click', function () {
    $(this).select();
});