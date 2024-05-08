import yfinance as yf
from flask import request, render_template, jsonify, Flask
import requests
from flask import jsonify
import feedparser

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    try:
        # Pobierz ticker z danych przesłanych w formie JSON
        ticker = request.get_json()['ticker']

        # Pobierz dane historyczne dla danego tickera (na przykład, dla ostatniego roku)
        data = yf.Ticker(ticker).history(period='1y')

        # Zwróć informacje o cenie zamknięcia i otwarcia dla ostatniego wpisu
        return jsonify({
            'currentPrice': data.iloc[-1].Close,
            'openPrice': data.iloc[-1].Open
        })
    
    except Exception as e:
        # W przypadku wystąpienia błędu, zwróć odpowiedź JSON z informacją o błędzie
        return jsonify(success=False, error=str(e))


def get_stock_info_for_ticker(ticker):
    try:
        # Pobierz obiekt Ticker dla danego tickera
        ticker_obj = yf.Ticker(ticker)

        # Pobierz pełne informacje o tickersie za pomocą metody info()
        ticker_info = ticker_obj.info

        # Zdefiniuj listę kluczowych atrybutów do wyświetlenia
        key_attributes = [
            'longName', 'symbol', 'currentPrice', 'open', 'previousClose',
            'dayLow', 'dayHigh', 'dividendRate', 'dividendYield', 'marketCap',
            'trailingPE', 'forwardPE', 'volume', 'averageVolume', 'beta'
        ]

        # Wybierz tylko kluczowe atrybuty z pełnych informacji
        selected_info = {key: ticker_info.get(key, None) for key in key_attributes}

        # Zwróć wyselekcjonowane informacje jako słownik
        return selected_info
    except Exception as e:
        # W przypadku wystąpienia błędu, zwróć None
        return None

def get_stock_info_from_coingecko(ticker):
    try:
        # CoinGecko API endpoint
        coingecko_url = f'https://api.coingecko.com/api/v3/simple/price'
        
        # Parametry zapytania
        params = {
            'ids': ticker,
            'vs_currencies': 'usd'
        }

        # Wyślij zapytanie do CoinGecko
        response = requests.get(coingecko_url, params=params)
        data = response.json()

        # Sprawdź, czy otrzymano dane z CoinGecko
        if ticker in data and 'usd' in data[ticker]:
            return {
                'name': ticker,
                'symbol': ticker,
                'currentPrice': data[ticker]['usd']
            }
        else:
            return None
    except Exception as e:
        # W przypadku wystąpienia błędu, zwróć None
        return None

def get_stock_info(ticker):
    # Spróbuj pobrać informacje z yfinance
    ticker_info = get_stock_info_for_ticker(ticker)

    if ticker_info:
        return ticker_info
    else:
        # Spróbuj pobrać informacje z CoinGecko
        coingecko_info = get_stock_info_from_coingecko(ticker)

        if coingecko_info:
            return coingecko_info
        else:
            # Jeśli brak danych z obu źródeł, zwróć None
            return None

@app.route('/<param>')
def dynamic_page_or_ticker(param):
    # Dostępne podstrony
    allowed_pages = ['wallet', 'newss', 'settings', 'index']

    # Sprawdź, czy żądany parametr jest jednym z tickersów
    ticker_info = get_stock_info(param)

    if param in allowed_pages:
        # Jeśli parametr jest jedną z dozwolonych stron, zwróć odpowiednią stronę HTML
        return render_template(f'{param}.html')
    elif ticker_info:
        # Jeśli tak, zwróć odpowiednią stronę HTML dla tickera
        return render_template('ticker_page.html', ticker=param, ticker_info=ticker_info)
    else:
        # Jeśli parametr nie pasuje ani do tickera, ani do dozwolonych stron, obsłuż to odpowiednio (np. przekierowanie do strony błędu)
        return render_template('error.html', error_message='Invalid Request')


def get_long_name(ticker_symbol):
    try:
        # Uzyskaj obiekt Ticker dla danego tickera
        ticker = yf.Ticker(ticker_symbol)

        # Pobierz pełne informacje o tickersie za pomocą metody info()
        ticker_info = ticker.info

        # Sprawdź, czy atrybut 'longName' istnieje w informacjach o tickersie
        if 'longName' in ticker_info:
            return jsonify({'long_name': ticker_info['longName']})
        else:
            return jsonify({'long_name': None})
    except Exception as e:
        print(f"Błąd pobierania danych dla tickera {ticker_symbol}: {e}")
        return jsonify({'long_name': None})

@app.route('/add_ticker/<ticker>')
def add_ticker(ticker):
    # Pobierz informacje o tickerze, w tym długą nazwę
    long_name = get_long_name(ticker)
    ticker_info = get_stock_info_for_ticker(ticker)

    # Jeśli brak informacji, zwróć odpowiednią odpowiedź lub przekieruj na stronę błędu
    if not ticker_info or not long_name:
        return render_template('error.html', error_message='Invalid Ticker or Data Retrieval Error')

    return long_name

def get_crypto_news_from_rss(category):
    feeds = {
        'kryptowaluty': 'https://cryptoslate.com/feed/',
        'forex': 'https://pl.investing.com/rss/news_301.rss',
        'finanse': 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    }
    url = feeds.get(category, 'https://cryptoslate.com/feed/')

    # Pobierz dane z RSS feed
    feed = feedparser.parse(url)

    # Przetwórz każdy artykuł
    articles = []
    for entry in feed.entries:
        articles.append({
            'title': entry.title,
            'link': entry.link,
            'published': entry.published
        })
    return articles

@app.route('/newss', methods=['GET', 'POST'])
def crypto_news():
    selected_category = 'general'  # Ustawienie domyślnej kategorii

    if request.method == 'POST':
        # Pobranie wybranej kategorii z formularza
        selected_category = request.form.get('category', 'general')

    # Pobranie artykułów z wybranej kategorii
    news = get_crypto_news_from_rss(selected_category)

    # Przekazanie zarówno newsów, jak i wybranej kategorii do szablonu
    return render_template('newss.html', news=news, selected_category=selected_category)

if __name__ == '__main__':
    app.run(debug=True)
