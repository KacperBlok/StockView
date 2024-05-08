// script.js

var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 15;

function startUpdateCycleO() {
    updatePrices();
    setInterval(function () {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000);
}

$(document).ready(function () {
    

    tickers.forEach(function (ticker) {
        addTickerToGrid(ticker);

    });

    updatePrices();

    $('#add-ticker-form').submit(function (event) {
        event.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
        }
        $('#new-ticker').val('');
        updatePrices();
    });

    $('#tickers-grid').on('click', '.remove-btn', function (event) {
        event.stopPropagation(); // Zapobiega propagacji kliknięcia do rodzica
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        $(`[id="${tickerToRemove}"]`).remove();
        updatePrices();
    });
    

    $('#tickers-grid').on('click', '.stock-box', function () {
        var ticker = $(this).attr('id');
        window.location.href = 'http://127.0.0.1:5000/' + ticker;
    });

    startUpdateCycleO();
});

// Funkcja do pobierania LongName

function getLongName(ticker, callback) {
    $.ajax({
        type: 'GET',
        url: `http://127.0.0.1:5000/add_ticker/${ticker}`,
        success: function (data) {
            callback(data);
        },
        error: function (error) {
            console.error('Błąd pobierania danych:', error);
            callback(null);
        }
    });
}


// Funkcja do dodawania tickera do grida
function addTickerToGrid(ticker) {
    // Pobierz informacje o tickerze, w tym długą nazwę
    getLongName(ticker, function (longName) {
        // Dodaj ticker do grida
        if (longName !== null && longName !== undefined) {
            $('#tickers-grid').append(
                '<div id="' + ticker + '" class="stock-box">' +
                    '<h2>' + ticker + '</h2>' +
                    '<p>' + longName.long_name + '</p>' +
                    '<p id="' + ticker + '-price"></p>' +
                    '<p id="' + ticker + '-pct"></p>' +
                    '<button class="remove-btn" data-ticker="' + ticker + '">X</button>' +
                '</div>'
            );
        } else {
            console.error('Dla tickera ' + ticker + ' brak długiej nazwy.');
        }
    });
}
function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            type: 'POST',
            url: 'http://127.0.0.1:5000/get_stock_data',
            contentType: 'application/json;charset=UTF-8',
            data: JSON.stringify({ 'ticker': ticker }),
            success: function (data) {
                console.log('Odpowiedź serwera:', data);
                if (data && data.currentPrice !== undefined && data.openPrice !== undefined) {
                    var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                    var colorClass;
                    if (changePercent <= -2) {
                        colorClass = 'dark-red';
                    } else if (changePercent <= 0) {
                        colorClass = 'red';
                    } else if (changePercent == 0) {
                        colorClass = 'gray';
                    } else if (changePercent <= 2) {
                        colorClass = 'green';
                    } else {
                        colorClass = 'dark-green';
                    }

                    // Formatuj cenę i procent zmiany
                    const formattedPrice = formatPrice(data.currentPrice);
                    const formattedChangePercent = `${changePercent.toFixed(2)}%`;

                    // Ustaw nowe wartości i klasy kolorów
                    $(`[id="${ticker}-price"]`).text(formattedPrice);
                    $(`[id="${ticker}-pct"]`).text(formattedChangePercent);
                    $(`[id="${ticker}-price"]`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                    $(`[id="${ticker}-pct"]`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                    var flashClass;
                    if (lastPrices[ticker] > data.currentPrice) {
                        flashClass = 'red-flash';
                    } else if (lastPrices[ticker] < data.currentPrice) {
                        flashClass = 'green-flash';
                    } else {
                        flashClass = 'gray-flash';
                    }
                    lastPrices[ticker] = data.currentPrice;

                    $(`[id="${ticker}"]`).addClass(flashClass);
                    setTimeout(function () {
                        $(`[id="${ticker}"]`).removeClass(flashClass);
                    }, 1000);
                } else {
                    console.error(`Dla tickera ${ticker} brak danych lub niepoprawny format.`);
                }
            },
            error: function (error) {
                console.error('Błąd pobierania danych:', error);
            }
        });
    });
}

function formatPrice(price) {
    let formattedPrice;

    // Konwertuj cenę na string, aby sprawdzić pierwszą i drugą cyfrę
    const priceString = price.toString();

    // Sprawdź, czy pierwsza lub druga cyfra jest większa od zera
    if (parseInt(priceString[1]) > 0 || parseInt(priceString[2]) > 0) {
        formattedPrice = price.toFixed(3);
    } else {
        formattedPrice = price.toFixed(8);
    }

    return `$${formattedPrice}`;
}

window.onload = function() {
    var path = window.location.pathname;
    var activeIconId;

    switch (path) {
        case '/index':
            activeIconId = 'icon-home';
            break;
        case '/newss':
            activeIconId = 'icon-newss';
            break;
        case '/wallet':
            activeIconId = 'icon-wallet';
            break;
        case '/settings':
            activeIconId = 'icon-settings';
            break;
        default:
            return; // Brak działania dla innych ścieżek
    }

    var activeIcon = document.getElementById(activeIconId);
    if (activeIcon) {
        activeIcon.classList.add('active-icon');
    }
}