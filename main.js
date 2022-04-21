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

        wordArr = wordArr.filter(word => word.substring(position-1,position) == item.letter);
    };
    for (item of yellowArr){
        let position = item.position;
        position = Number(position.substring(position.length - 1));

        wordArr = wordArr.filter(word => word.substring(position-1,position) != item.letter);
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
        $(`.guess${i} input`).val('');
        $(`.guess${i}`).addClass('disabled');
    };
};

$('.guessCount').on('click', function (e) {
    $('.guessCount').removeClass('countPicked');
    $(e.target).addClass('countPicked');
    enableGuessRows();
});

$('.dropbtn').on('click', function (e) {
    if (!$(e.target).closest('.guess').hasClass('disabled')) {
        let guess = $(e.target).closest('.guess');
        guess = guess[0].classList[1];

        let letter = $(e.target).closest('.letter');
        letter = letter[0].classList[1];

        let dropdowns = $('.drop-colors')
        for (dropdown of dropdowns) {
            if ($(dropdown).closest('.guess').hasClass(`${guess}`) && $(dropdown).closest('.letter').hasClass(`${letter}`)) {
                $(dropdown).toggleClass('showDrop');
            } else {
                $(dropdown).removeClass('showDrop');
            };
        };
    };
});

$(window).on('click', function (e) {
    if ($(e.target).closest('.colors').length != 0) return false;
    $('.drop-colors').removeClass('showDrop');
});

$('.green').on('click', function (e) {
    let guess = $(e.target).closest('.guess');
    guess = guess[0].classList[1];

    let letter = $(e.target).closest('.letter');
    letter = letter[0].classList[1];

    $(`.${guess}>.${letter} input`).addClass('green');
    $(`.${guess}>.${letter} input`).removeClass('yellow');
    $(`.${guess}>.${letter} input`).removeClass('gray');

    $('.drop-colors').removeClass('showDrop');
});

$('.yellow').on('click', function (e) {
    let guess = $(e.target).closest('.guess');
    guess = guess[0].classList[1];

    let letter = $(e.target).closest('.letter');
    letter = letter[0].classList[1];

    $(`.${guess}>.${letter} input`).removeClass('green');
    $(`.${guess}>.${letter} input`).addClass('yellow');
    $(`.${guess}>.${letter} input`).removeClass('gray');

    $('.drop-colors').removeClass('showDrop');
});

$('.gray').on('click', function (e) {
    let guess = $(e.target).closest('.guess');
    guess = guess[0].classList[1];

    let letter = $(e.target).closest('.letter');
    letter = letter[0].classList[1];

    $(`.${guess}>.${letter} input`).removeClass('green');
    $(`.${guess}>.${letter} input`).removeClass('yellow');
    $(`.${guess}>.${letter} input`).addClass('gray');

    $('.drop-colors').removeClass('showDrop');
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
                } else if (greenArr.some(item => item.position == position)){
                    return;
                } else {
                    greenArr.push({ 'letter': letter.value.toLowerCase(), position });
                };
            };
            if ($(letter).hasClass('yellow')){
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