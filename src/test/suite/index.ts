import * as path from 'path';
import * as Mocha from 'mocha';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  // Add test file directly
  mocha.addFile(path.resolve(testsRoot, 'extension.test.js'));

  return new Promise((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
} 