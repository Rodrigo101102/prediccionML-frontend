// Simple validation script to check our TypeScript improvements
import { NetworkInterface, CaptureResult } from '../types';

// Test NetworkInterface type
const testInterface: NetworkInterface = {
  name: 'eth0',
  display_name: 'Ethernet Connection'
};

// Test CaptureResult type
const testResult: CaptureResult = {
  total_flows: [{ name: 'test', description: 'test flow' }],
  anomalias: [{ name: 'DDOS', description: 'Distributed denial of service detected' }],
  normal: [{ name: 'BENIGN', description: 'Normal traffic' }],
  porcentaje_anomalias: 25.5,
  predicciones_path: '/path/to/predictions.csv',
  csv_path: '/path/to/data.csv'
};

// Test input validation logic
function validateDuration(input: string): number | null {
  const val = parseInt(input);
  if (!isNaN(val) && val >= 10 && val <= 300) {
    return val;
  }
  return null;
}

// Test cases
console.log('Validation tests:');
console.log('Valid duration 30:', validateDuration('30')); // Should return 30
console.log('Invalid duration 5:', validateDuration('5')); // Should return null
console.log('Invalid duration 400:', validateDuration('400')); // Should return null
console.log('Invalid duration abc:', validateDuration('abc')); // Should return null

export { testInterface, testResult, validateDuration };