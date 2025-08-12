// Configuración adicional para Jest
const jestHtmlReporter = require('jest-html-reporter');

jest.getEnv().addReporter(
  jestHtmlReporter({
    outputPath: './test-report.html',
    pageTitle: 'Reporte de Pruebas'
  })
);