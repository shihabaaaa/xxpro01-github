// Assuming you're using Chart.js

// Data for Gauge Chart
const gaugeData = {
    // ... data specific to gauge chart format
  };
  
  // Data for Line Chart
  const lineData = {
    // ... data specific to line chart format
  };
  
  // Create Gauge Chart
  const gaugeCtx = document.getElementById('gaugeDiv').getContext('2d');
  const gaugeChart = new Chart(gaugeCtx, {
    type: 'doughnut', // Example chart type for gauge
    data: gaugeData,
    // ... other chart configuration options
  });
  
  // Create Line Chart
  const lineCtx = document.getElementById('lineDiv').getContext('2d');
  const lineChart = new Chart(lineCtx, {
    type: 'line', // Example chart type for line chart
    data: lineData,
    // ... other chart configuration options
  });
  