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

// Simple test to ensure it works
describe('Type validation', () => {
  test('should validate duration correctly', () => {
    expect(validateDuration('30')).toBe(30);
    expect(validateDuration('5')).toBe(null);
    expect(validateDuration('400')).toBe(null);
    expect(validateDuration('abc')).toBe(null);
  });

  test('should have correct interface structure', () => {
    expect(testInterface.name).toBe('eth0');
    expect(testInterface.display_name).toBe('Ethernet Connection');
  });

  test('should have correct result structure', () => {
    expect(testResult.porcentaje_anomalias).toBe(25.5);
    expect(Array.isArray(testResult.anomalias)).toBe(true);
  });
});

export { testInterface, testResult, validateDuration };