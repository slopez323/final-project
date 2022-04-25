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
    $('.results').show();
    $(window).scrollTop('1000');
};

enableGuessRows();

function enableGuessRows() {
    // $(`.guess input`).attr('disabled', false);
    $('.guess').removeClass('disabled');

    let guessCount = Number($('.countPicked').text());
    for (let i = guessCount + 1; i <= 6; i++) {
        // $(`.guess${i} input`).attr('disabled', 'disabled');
        $(`.guess${i} .input`).text('').removeClass('green yellow gray');
        $(`.guess${i}`).addClass('disabled');
    };

    for (let i = 1; i <= guessCount; i++) {
        for (let j = 1; j <= 5; j++) {
            if ($(`.guess${i} .letter${j} .input`).text() == '') {
                // $(`.guess${i} .letter${j} input`).focus().addClass('currentBox');
                $(`.guess${i} .letter${j} .input`).addClass('currentBox');
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
    $('#errorMsg').hide();
    if (!$(e.target).closest('.guess').hasClass('disabled')) {
        let guess = $(e.target).closest('.guess');
        guess = guess[0].classList[1];

        let letter = $(e.target).closest('.letter');
        letter = letter[0].classList[1];

        let inputBox = $(`.${guess}>.${letter} .input`);

        if ($(inputBox).hasClass('gray')) {
            $(inputBox).addClass('green').removeClass('gray');
        } else if ($(inputBox).hasClass('green')) {
            $(inputBox).addClass('yellow').removeClass('green');
        } else {
            $(inputBox).addClass('gray').removeClass('yellow');
        };
    };
});

$('#generate').on('click', generateWords);

function checkInputs() {
    let guessCount = Number($('.countPicked').text());
    for (let i = 1; i <= guessCount; i++) {
        let word = $(`.guess${i} .input`)
        for (letter of word) {
            if (letter.value == '') {
                $('#errorMsg').text('Fill in all guessed words.');
                $('#errorMsg').show();
                return;
            };
            if (!$(letter).hasClass('green') && !$(letter).hasClass('yellow') && !$(letter).hasClass('gray')) {
                $('#errorMsg').text('All guess boxes must be colored.');
                $('#errorMsg').show();
                return;
            };
            if ($(letter).hasClass('green')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                if (greenArr.some(item => item.position == position && item.letter != letter.value)) {
                    $('#errorMsg').text('Conflicting green boxes.');
                    $('#errorMsg').show();
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
    

    if (e.which >= 65 && e.which <= 90) {
        $('.currentBox').text(e.key);
        nextBox();
    } else if (e.which == 8) {
        $('.currentBox').text('');
        prevBox();
    };

    // $(e.target).removeClass('currentBox');
});

$('.input').on('click', function (e) {
    if (!$(e.target).closest('.guess').hasClass('disabled')) {
        $('#errorMsg').text('');
        $('#errorMsg').hide();
        $('.input').removeClass('currentBox');
        $(this).addClass('currentBox');
    };
});

if (window.matchMedia("(pointer: coarse)").matches) {
    $('.keyboard').removeClass('hideKey');
    $('#generate').hide();
    $('.results').hide();
    // $('input').attr('readonly', 'readonly');
};

$('.key').on('click', function (e) {
    if (!$(e.target).is('#key-ent') && !$(e.target).is('#key-back') && !$(e.target).is('i')) {
        $('.currentBox').text(`${$(e.target).text()}`);
        // $('.input').removeClass('currentBox');
        nextBox();
    } else if ($(e.target).is('i') || $(e.target).is('#key-back')) {
        if ($('.currentBox').text() != '') $('.currentBox').text('');
        // $('.input').removeClass('currentBox');
        prevBox();
    } else {
        generateWords();
    };
});

function nextBox() {
    let parentLetter = $('.currentBox').closest('.letter');
    let parentGuess = $('.currentBox').closest('.guess');
    console.log($('.currentBox'));

    $('.input').removeClass('currentBox');

    if (parentLetter[0].nextElementSibling) {
        let nextLetter = parentLetter[0].nextElementSibling;
        $(nextLetter).children('.input').addClass('currentBox');
    } else {
        let nextGuess = parentGuess[0].nextElementSibling;
        if ($(nextGuess).hasClass('guess') && !$(nextGuess).hasClass('disabled')) {
            $(nextGuess).find('.letter1 .input').addClass('currentBox');
        };
    };
};

function prevBox() {
    let parentLetter = $('.currentBox').closest('.letter');
    let parentGuess = $('.currentBox').closest('.guess');

    $('.input').removeClass('currentBox');

    if (parentLetter[0].previousElementSibling) {
        let prevLetter = parentLetter[0].previousElementSibling;
        $(prevLetter).children('.input').addClass('currentBox');
    } else {
        if (parentGuess[0].previousElementSibling) {
            let prevGuess = parentGuess[0].previousElementSibling;
            if ($(prevGuess).hasClass('guess')) {
                $(prevGuess).find('.letter5 .input').addClass('currentBox');
            };
        };
    };
};

function generateWords() {
    greenArr = [];
    yellowArr = [];
    grayArr = [];
    $('#errorMsg').text('');
    $('#errorMsg').hide();
    $('#displayList').empty();

    checkInputs();
    if ($('#errorMsg').text() == '') {
        getWords();
    };
};