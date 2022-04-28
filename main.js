let grayArr = [];
let greenArr = [];
let yellowArr = [];

// show custom virtual keyboard if using mobile / touchscreen
if (window.matchMedia("(pointer: coarse)").matches) {
    $('.keyboard').removeClass('hide');
    $('#generate').hide();
};

enableGuessRows();

// user chooses how many guesses they've made so far
$('.guessCount').on('click', function (e) {
    $('.guessCount').removeClass('countPicked');
    $(e.target).addClass('countPicked');
    enableGuessRows();
});

// (1) only enable # of rows based on user input of # of guesses they've made so far, (2) automatically switch focus to first empty box
function enableGuessRows() {
    $('.guess').removeClass('disabled');

    let guessCount = Number($('.countPicked').text());
    for (let i = guessCount + 1; i <= 6; i++) {
        $(`.guess${i} .input`).text('').removeClass('green yellow gray');
        $(`.guess${i}`).addClass('disabled');
        $('.input').removeClass('currentBox');
    };

    for (let i = 1; i <= guessCount; i++) {
        for (let j = 1; j <= 5; j++) {
            if ($(`.guess${i} .letter${j} .input`).text() == '') {
                $('.input').removeClass('currentBox');
                $(`.guess${i} .letter${j} .input`).addClass('currentBox');
                i = guessCount + 1;
                break;
            };
        };
    };
};

// if user clicks on an input box, switch focus to that box
$('.input').on('click', function (e) {
    if (!$(e.target).closest('.guess').hasClass('disabled')) {
        $('.input').removeClass('currentBox');
        $(this).addClass('currentBox');
    };
});

// fill boxes with letters user pressed on keyboard (using <span> instead of <input>)
$(window).on('keyup', function (e) {
    if (e.which >= 65 && e.which <= 90) {
        $('.currentBox').text(e.key);
        nextBox();
    } else if (e.which == 8) {
        $('.currentBox').text('');
        prevBox();
    };
});

// fill boxes with letters user pressed on virtual keyboard
$('.key').on('click', function (e) {
    if (!$(e.target).is('#key-ent') && !$(e.target).is('#key-back') && !$(e.target).is('i')) {
        $('.currentBox').text(`${$(e.target).text()}`);
        nextBox();
    } else if ($(e.target).is('i') || $(e.target).is('#key-back')) {
        if ($('.currentBox').text() != '') $('.currentBox').text('');
        prevBox();
    } else {
        generateWords();
    };
});

// switch between gray, green and yellow when clicking on color button for each letter box
$('.color-select').on('click', function (e) {
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

// move focus to next box after input
function nextBox() {
    let parentLetter = $('.currentBox').closest('.letter');
    let parentGuess = $('.currentBox').closest('.guess');

    if (parentLetter[0].nextElementSibling) {
        let nextLetter = parentLetter[0].nextElementSibling;
        $('.input').removeClass('currentBox');

        $(nextLetter).children('.input').addClass('currentBox');
    } else {
        let nextGuess = parentGuess[0].nextElementSibling;
        if ($(nextGuess).hasClass('guess') && !$(nextGuess).hasClass('disabled')) {
            $('.input').removeClass('currentBox');

            $(nextGuess).find('.letter1 .input').addClass('currentBox');
        };
    };
};

// move focus to prev box on backspace
function prevBox() {
    let parentLetter = $('.currentBox').closest('.letter');
    let parentGuess = $('.currentBox').closest('.guess');

    if (parentLetter[0].previousElementSibling) {
        let prevLetter = parentLetter[0].previousElementSibling;
        $('.input').removeClass('currentBox');

        $(prevLetter).children('.input').addClass('currentBox');
    } else {
        if (parentGuess[0].previousElementSibling) {
            let prevGuess = parentGuess[0].previousElementSibling;
            if ($(prevGuess).hasClass('guess')) {
                $('.input').removeClass('currentBox');

                $(prevGuess).find('.letter5 .input').addClass('currentBox');
            };
        };
    };
};

// on submit
$('#generate').on('click', generateWords);

// check inputs and get words if no errors
function generateWords() {
    greenArr = [];
    yellowArr = [];
    grayArr = [];
    $('#errorMsg').text('');
    $('#displayList').empty();

    checkInputs();
    if ($('#errorMsg').text() == '') {
        getWords();
    };
};

// (1) check if all boxes have been filled and colored, (2) check if there are multiple letters in the same position tagged as green since there can only be 1 correct letter per position, (3) store inputs in array for each color
function checkInputs() {
    let guessCount = Number($('.countPicked').text());
    for (let i = 1; i <= guessCount; i++) {
        let word = $(`.guess${i} .input`)
        for (letter of word) {
            if (letter.textContent == '') {
                $('#errorMsg').text('Missing letters.');
                $('#errorMsg').addClass('show');
                setTimeout(function () {
                    $('#errorMsg').removeClass('show')
                }, 800);
                return;
            };
            if (!$(letter).hasClass('green') && !$(letter).hasClass('yellow') && !$(letter).hasClass('gray')) {
                $('#errorMsg').text('Missing colors.');
                $('#errorMsg').addClass('show');
                setTimeout(function () {
                    $('#errorMsg').removeClass('show')
                }, 800);
                return;
            };
            if ($(letter).hasClass('green')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                if (greenArr.some(item => item.position == position && item.letter != letter.textContent.toLowerCase())) {
                    $('#errorMsg').text('Conflicting green boxes.');
                    $('#errorMsg').addClass('show');
                    setTimeout(function () {
                        $('#errorMsg').removeClass('show')
                    }, 800);
                    return;
                } else if (greenArr.some(item => item.position == position)) {
                    continue;
                } else {
                    greenArr.push({ 'letter': letter.textContent.toLowerCase(), position });
                };
            };
            if ($(letter).hasClass('yellow')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                if (yellowArr.some(item => item.position == position && item.letter == letter.textContent.toLowerCase())) {
                    continue;
                } else {
                    yellowArr.push({ 'letter': letter.textContent.toLowerCase(), position });
                };
            };
            if ($(letter).hasClass('gray')) {
                let position = $(letter).closest('.letter');
                position = position[0].classList[1];
                grayArr.push({ 'letter': letter.textContent.toLowerCase(), position });
            };
        };
    };
};

// pull all 5 letter words from json file and filter out words based on the color arrays, display all words that could still be possible given the results so far
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
        let position = item.position;
        position = Number(position.substring(position.length - 1));
        let greenLetters = greenArr.map(x => x.letter);

        if (greenLetters.includes(item.letter)) {
            wordArr = wordArr.filter(word => word.substring(position - 1, position) != item.letter);
        } else {
            wordArr = wordArr.filter(word => !word.includes(item.letter))
        };
    };
    $('#displayList').append(wordArr.map(word => `<li>${word}</li>`).join(''));
    $('.results').removeClass('hide');
    $(window).scrollTop('1000');
};

// for mobile / portrait version to go back to top / guess view from results
$('.up').on('click', function(){
    $(window).scrollTop('0');
});


// hide instructions that show up on startup when exit or area outside popup is clicked
$('.exit').on('click', function(){
    $('.instructions').hide();
});

$('.instructions').on('click', function(e){
    if($(e.target).closest('.popup').length === 0){
        $('.instructions').hide();
    };
});