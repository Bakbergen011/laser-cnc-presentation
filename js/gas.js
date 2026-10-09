/**
 * GAS.JS - Proportional Valve Assist Gas Controller (O2, N2, Air)
 */

const GasController = {
  currentGas: 'N2', // O2, N2, AIR
  pressureBar: 8.2,
  isOpen: true,

  setGasType(type) {
    this.currentGas = type;
    const hudType = document.getElementById('hud-gas-type');
    if (hudType) hudType.innerText = type;
  },

  setPressure(bar) {
    this.pressureBar = bar;
    const hudPress = document.getElementById('hud-gas-press');
    if (hudPress) hudPress.innerText = bar.toFixed(1);

    const chartGas = document.getElementById('chart-gas-val');
    if (chartGas) chartGas.innerText = `${bar.toFixed(1)} bar`;
  }
};
