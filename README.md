# Description
This is a web application that allows users to monitor and compare stock prices from the NASDAQ (US market) using the free Twelve Data API.
The app is designed to be simple, lightweight, and runs directly in any modern browser without requiring installation or backend setup.
This project is based of free plan of Twelve Data API (limitation on US market Only), there are some limitation regards number of api calls and on the data returned.

#   Features
   # 1) Dynamic chart (powered by Chart.js)

Main area (80% of the screen) dedicated to the stock chart.  

Displays the last 30 days of stock prices.  

X-axis shows day and month in short format (e.g., 7 Sep, 12 Aug).  

Y-axis shows the price in USD ($).  

Legend with stock symbols and line colors is displayed bottom-left.  

Chart title “US Market Stocks” is shown at the top center in bold white.


   # 2) Interactive stock list (right sidebar, 20%)  
   
Dynamically fetched from Twelve Data NASDAQ API.  

Only stocks with a valid name field are displayed.  

Includes a search bar to filter stocks by name.  

Supports multi-selection to compare multiple stocks at once.  

Interval change to show the behaviour of price

Dynamic x axis when interval is changed

   # 3) Stock details  
   
Below the stock list, metadata (from the meta field in the API response) is displayed.  

Example: exchange, currency, type, etc.  

Details area limited to 20% of the sidebar for a clean layout.

   # 4) User experience improvements

On first load, the chart is empty but ready (axes and title are shown).   

A helpful message appears inside the chart: “Select a stock to display its performance”.  

When a stock is selected, the message disappears and the chart is populated with data.

#   Technologies Used

HTML5: page structure  

CSS3: layout and theme (dark modern style, 80/20 split between chart and sidebar)  

JavaScript (Vanilla): core logic (API calls, event handling, chart updates)  

Chart.js (via CDN): chart rendering and interactivity  

Twelve Data API: financial data source (time series and metadata)

#   How To Use

1) Clone this repository  

2) Create a file named config.js in the project root:  

 *//config.js*

*const API_KEY = "YOUR_TWELVE_DATA_API_KEY";*

3) Open index.html in your browser.



