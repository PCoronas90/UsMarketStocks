const colorMap = {};
let chart;
let stocksData = [];
let currentInterval = '1day';  // default interval

function getColor(symbol) {
  if (!colorMap[symbol]) {
    const palette = ["#2563EB","#DC2626","#16A34A","#F59E0B","#9333EA","#0EA5E9","#D97706","#10B981"];
    colorMap[symbol] = palette[Object.keys(colorMap).length % palette.length];
  }
  return colorMap[symbol];
}

// Load stock list
async function loadStocksList() {
  const urlStocks = `https://api.twelvedata.com/stocks?country=United%20States&exchange=NASDAQ&apikey=${API_KEY}`;
  const res = await fetch(urlStocks);
  const json = await res.json();

  if (!json.data) return;
  stocksData = json.data.filter(stock => stock.name && stock.name.trim() !== "");
  populateSelect(stocksData);
}

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

// Search
document.getElementById("search").addEventListener("input", () => {
  const query = document.getElementById("search").value.toLowerCase();
  const filtered = stocksData.filter(s => s.name.toLowerCase().includes(query));
  populateSelect(filtered);
});

// Update interval
document.getElementById("interval-select").addEventListener("change", (e) => {
  currentInterval = e.target.value;
  loadData(); // reload chart with new interval
});

// Load data for selected stocks
async function loadData() {
  const select = document.getElementById("symbols");
  const selected = Array.from(select.selectedOptions).map(o => o.value);

  if (selected.length === 0) {
    renderEmptyChart();
    document.getElementById("details").innerText = "No stock selected.";
    return;
  }

  let datasets = [];
  let allLabelsSet = new Set();
  let detailsText = "";

  for (const sym of selected) {
    try {
      const urlHist = `https://api.twelvedata.com/time_series?symbol=${sym}&interval=${currentInterval}&outputsize=30&apikey=${API_KEY}`;
      const resHist = await fetch(urlHist);
      const jsonHist = await resHist.json();
      if (!jsonHist.values) continue;

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

    } catch(e) {
      console.error(e);
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
      scales: {
        x: {
          title: { display: true, text: 'Date', color: "#fff" },
		  
		  
          ticks: {
  color: "#fff",
  callback: function(value) {
    const date = new Date(this.getLabelForValue(value));
    const day = date.getDate();
    const month = date.toLocaleString("en-US",{month:"short"});

    if (["1day", "1week", "1month"].includes(currentInterval)) {
      return `${day} ${month}`;
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${hours}:${minutes}`;
  }
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

// Render empty chart with placeholder text
function renderEmptyChart() {
  if (chart) chart.destroy();
  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: { labels: [], datasets: [] },
    options: { responsive: true,
      plugins: { title: { display: true, text: "US Market Stocks", color: "#fff", font:{size:18, weight:"bold"} } } },
    plugins: [{
      id: 'emptyChart',
      afterDraw: c => {
        if (c.data.datasets.length === 0) {
          const ctx = c.ctx;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#888';
          ctx.font = '16px Arial';
          ctx.fillText('Select a stock to display its performance', c.width/2, c.height/2);
          ctx.restore();
        }
      }
    }]
  });
}

// Init
loadStocksList();
renderEmptyChart();
document.getElementById("symbols").addEventListener("change", loadData);
