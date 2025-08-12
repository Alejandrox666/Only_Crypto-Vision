module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageReporters: ['html', 'text'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        outputPath: './test-report.html',
        pageTitle: 'Reporte de Pruebas',
        includeFailureMsg: true,
        includeConsoleLog: true,
        verbose: true
      }
    ]
  ],
  transformIgnorePatterns: [
    'node_modules/(?!axios)'
  ]
};