/**
 * ENCODER.JS - 23-Bit Optical Absolute Encoder Feedback Math & Telemetry
 */

const EncoderManager = {
  resolutionBits: 23,
  pulsesPerRev: 8388608, // 2^23 pulses
  gearRatio: 10, // 10:1 Planetary Reducer
  pitchMM: 40, // 40 mm per motor turn (rack & pinion)

  // Converts physical millimeters to absolute encoder counts
  mmToCounts(mm) {
    const turns = mm / this.pitchMM;
    return Math.floor(turns * this.pulsesPerRev);
  },

  // Converts encoder raw count to engineering mm
  countsToMM(counts) {
    const turns = counts / this.pulsesPerRev;
    return turns * this.pitchMM;
  },

  getEncoderTelemetry(axis) {
    const posMM = AxesController.position[axis] || 0;
    const rawCounts = this.mmToCounts(posMM);
    return {
      axis: axis.toUpperCase(),
      posMM: posMM.toFixed(3),
      rawCounts: rawCounts,
      crcStatus: 'PASS',
      communication: 'BiSS-C Point-to-Point'
    };
  }
};
