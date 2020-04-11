// Use ES module import syntax to import functionality from the module
// that we have compiled.
//
// Note that the `default` import is an initialization function which
// will 'boot' the module and make it ready to use. Currently browsers
// don't support natively imported WebAssembly as an ES module, but
// eventually the manual initialization won't be required!
import init, { solve } from './pkg/sir_model.js';

const varNames = ['trans', 'recov', 'tmax', 's0', 'i0', 'r0'];
const varDefaults = [3.2, 0.23, 20, 0.99, 0.01, 0];

function updateParamLabel(name) {
  let inputElem = document.getElementById(`${name}-value`);
  document.getElementById(`${name}-disp`).innerHTML = inputElem.value;
}

function displayError(msg) {
  let errMsg = document.getElementById('err-msg');
  errMsg.innerHTML = msg;
  let errBox = document.getElementById('err-box');
  errBox.classList.remove('d-none');
}

function hideError() {
  let errBox = document.getElementById('err-box');
  errBox.classList.add('d-none');
}

function plot(data) {
  let plotElem = document.getElementById('plot');
  Plotly.newPlot(
    plotElem,
    [
      {
        x: data.tout,
        y: data.yout.map((y) => y[0]),
        name: 'Susceptible',
        mode: 'lines',
      },
      {
        x: data.tout,
        y: data.yout.map((y) => y[1]),
        name: 'Infected',
        mode: 'lines',
      },
      {
        x: data.tout,
        y: data.yout.map((y) => y[2]),
        name: 'Recovered',
        mode: 'lines',
      },
      {
        x: data.tout,
        y: data.yout.map((y) => y[1] + y[2]),
        name: 'Cases',
        mode: 'lines',
      }
    ],
    {
      xaxis: { title: 'Time' },
      yaxis: { title: 'Population Fraction' },
    }
  );
}

function buildConfiguration() {
  return {
    'trans': parseFloat(document.getElementById('trans-value').value),
    'recov': parseFloat(document.getElementById('recov-value').value),
    'init': [
      parseFloat(document.getElementById('s0-value').value),
      parseFloat(document.getElementById('i0-value').value),
      parseFloat(document.getElementById('r0-value').value),
    ],
    'tmax': parseFloat(document.getElementById('tmax-value').value),
  }
}

function updatePlot() {
  const config = buildConfiguration();
  const initSum = config.init.reduce((s, x) => { return s + x; });

  if (initSum != 1.0) {
    displayError("Sorry, initial solution values have to add up to 1.");
    return;
  }

  const result = solve(config);
  plot(result);
}

// Event bindings.

varNames.forEach(
  (n) => {
    ['change', 'input'].forEach(
      (ename) => {
        document.getElementById(`${n}-value`).addEventListener(
          ename, (_) => { updateParamLabel(n); }
        );
      }
    );
    updateParamLabel(n);
  }
);

document.getElementById("reset").addEventListener(
  "click",
  () => {
    varNames.forEach(
      (n, i, _) => {
        document.getElementById(`${n}-value`).value = varDefaults[i];
        updateParamLabel(n);
      }
    )
  }
);

document.getElementById("solve").addEventListener(
  "click", () => { updatePlot(); }
);

document.getElementById("dismiss").addEventListener(
  "click", () => { hideError(); }
);

// Load wasm and initialise plot.

async function run() {
  await init();
  updatePlot();
}

run();