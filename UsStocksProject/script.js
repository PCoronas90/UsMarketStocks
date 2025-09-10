// Make sure config.js is loaded before this script
let chart;
let stocksData = [];
const colorMap = {};

function getColor(symbol) {
  if (!colorMap[symbol]) {
    const palette = ["#2563EB","#DC2626","#16A34A","#F59E0B","#9333EA","#0EA5E9","#D97706","#10B981"];
    colorMap[symbol] = palette[Object.keys(colorMap).length % palette.length];
  }
  return colorMap[symbol];
}

// ... resto del codice invariato, usa direttamente API_KEY che arriva da config.js ...


// Load stock list dynamically
async function loadStocksList() {
  const urlStocks = `https://api.twelvedata.com/stocks?country=United%20States&exchange=NASDAQ&apikey=${API_KEY}`;
  const res = await fetch(urlStocks);
  const json = await res.json();

  if (!json.data) {
    document.getElementById("symbols").innerHTML = "<option>No stocks found</option>";
    return;
  }

  stocksData = json.data.filter(stock => stock.name && stock.name.trim() !== "");
  populateSelect(stocksData);
}

// Populate select box
function populateSelect(data) {
  const select = document.getElementById("symbols");
  select.innerHTML = "";
  data.forEach(stock => {
    const option = document.createElement("option");
    option.value = stock.symbol;
    option.text = `${stock.symbol} - ${stock.name}`;
    select.appendChild(option);
  });
}

// Search functionality
document.getElementById("search").addEventListener("input", () => {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = stocksData.filter(stock => stock.name.toLowerCase().includes(query));
  populateSelect(filtered);
});

// Load and display data
async function loadData() {
  const select = document.getElementById("symbols");
  const selected = Array.from(select.selectedOptions).map(opt => opt.value);

  if (selected.length === 0) {
    document.getElementById("details").innerHTML = "No stock selected.";
    renderEmptyChart();
    return;
  }

  let datasets = [];
  let allLabelsSet = new Set();
  let detailsText = "";

  for (const sym of selected) {
    try {
      const urlHist = `https://api.twelvedata.com/time_series?symbol=${sym}&interval=1day&outputsize=30&apikey=${API_KEY}`;
      const resHist = await fetch(urlHist);
      const jsonHist = await resHist.json();

      if (!jsonHist.values) {
        detailsText += `⚠️ Error for ${sym}\n`;
        continue;
      }

      const labels = jsonHist.values.map(v => v.datetime).reverse();
      const prices = jsonHist.values.map(v => parseFloat(v.close)).reverse();
      labels.forEach(l => allLabelsSet.add(l));

      datasets.push({
        label: sym,
        data: prices,
        borderColor: getColor(sym),
        fill: false,
        tension: 0.1
      });

      if (jsonHist.meta) {
        detailsText += `${sym} | Exchange: ${jsonHist.meta.exchange} | Currency: ${jsonHist.meta.currency} | Type: ${jsonHist.meta.type}\n`;
      }
    } catch (e) {
      detailsText += `Fetch error for ${sym}: ${e}\n`;
    }
  }

  const allLabels = Array.from(allLabelsSet).sort();

  if (chart) chart.destroy();
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: { labels: allLabels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "US Market Stocks",
          color: "#fff",
          font: { size: 18, weight: "bold" }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: context => `${context.dataset.label}: ${context.formattedValue}$`
          }
        },
        legend: { display: true, position: "bottom", align: "start" }
      },
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: {
          title: { display: true, text: 'Date', color: "#fff" },
          ticks: {
            callback: function(value, index) {
              const date = new Date(this.getLabelForValue(value));
              const day = date.getDate();
              const month = date.toLocaleString("en-US", { month: "short" });
              return `${day} ${month}`;
            },
            color: "#fff"
          }
        },
        y: {
          title: { display: true, text: 'Price ($)', color: "#fff" },
          ticks: { color: "#fff" }
        }
      }
    }
  });

  document.getElementById("details").innerText = detailsText;
}

// Render empty chart
function renderEmptyChart() {
  if (chart) chart.destroy();
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "US Market Stocks",
          color: "#fff",
          font: { size: 18, weight: "bold" }
        }
      }
    },
    plugins: [{
      id: 'emptyChart',
      afterDraw: chart => {
        if (chart.data.datasets.length === 0) {
          const ctx = chart.ctx;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#888';
          ctx.font = '16px Arial';
          ctx.fillText('Select a stock to display its performance', chart.width / 2, chart.height / 2);
          ctx.restore();
        }
      }
    }]
  });
}

document.getElementById("symbols").addEventListener("change", loadData);

// Initialize
loadStocksList();
renderEmptyChart();
