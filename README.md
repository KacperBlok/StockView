![image](https://github.com/KacperBlok/StockView/assets/36439187/5090a850-b827-44bc-bb66-25370ea03c03)

# Stock Tracker & News Aggregator

This is a Flask web application that enables users to track stock prices using the Yahoo Finance API, and also provides a news section where users can follow news from various categories.

## Features

- **Stock Tracking**: Users can search for stock symbols and track their prices.
- **News Aggregator**: Users can read news articles from various categories such as business, technology, sports, etc.
- **Simple User Interface**: The UI is designed to be intuitive and easy to use.

## Technologies Used

- Python
- Flask
- Yahoo Finance API
- HTML/CSS
- Jinja2 Templates

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/KacperBlok/StockView
   ```

2. Install the required packages:

   ```
   pip install -r requirements.txt
   ```

3. Set up your environment variables:

   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     FLASK_APP=app.py
     FLASK_ENV=development
     ```

4. Run the application:

   ```
   python app.py
   ```

5. Open your web browser and navigate to `http://localhost:5000` to use the application.

## Usage

### Stock Tracking

1. Enter a stock symbol (e.g., AAPL for Apple Inc.) in the search bar.
2. Click the "Search" button.
3. The current price of the stock will be displayed.

### News Aggregator

1. Click on the "News" tab in the navigation bar.
2. Select a category from the dropdown menu.
3. The latest news articles from that category will be displayed.




![image](https://github.com/KacperBlok/StockView/assets/36439187/67e3b782-b9d7-4a2b-a0df-972d12f2d27c)


![image](https://github.com/KacperBlok/StockView/assets/36439187/a4b7299a-8359-4475-98e8-a06323bbabb4)

