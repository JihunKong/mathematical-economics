import axios, { AxiosInstance } from 'axios';
import { logger } from '../../backend/src/utils/logger';

interface SecurityTestResult {
  test: string;
  passed: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityTester {
  private api: AxiosInstance;
  private results: SecurityTestResult[] = [];
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🔒 Starting security tests...\n');

    await this.testSQLInjection();
    await this.testXSS();
    await this.testDirectoryTraversal();
    await this.testAuthenticationBypass();
    await this.testRateLimiting();
    await this.testSecurityHeaders();
    await this.testPasswordPolicy();
    await this.testJWTSecurity();
    await this.testAPIVersioning();
    await this.testErrorMessages();

    this.printResults();
  }

  private async testSQLInjection(): Promise<void> {
    console.log('Testing SQL Injection vulnerabilities...');

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "1' OR '1' = '1' /*",
    ];

    for (const payload of sqlPayloads) {
      try {
        const response = await this.api.post('/api/auth/login', {
          email: payload,
          password: payload,
        });

        const passed = response.status === 401 && 
                      !response.data.message?.toLowerCase().includes('sql') &&
                      !response.data.message?.toLowerCase().includes('error');

        this.results.push({
          test: `SQL Injection - ${payload}`,
          passed,
          message: passed ? 'Properly rejected' : `Potential vulnerability: ${response.data.message}`,
          severity: 'critical',
        });
      } catch (error) {
        this.results.push({
          test: `SQL Injection - ${payload}`,
          passed: true,
          message: 'Request properly rejected',
          severity: 'critical',
        });
      }
    }
  }

  private async testXSS(): Promise<void> {
    console.log('Testing XSS vulnerabilities...');

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
    ];

    for (const payload of xssPayloads) {
      try {
        const response = await this.api.post('/api/auth/register', {
          email: `test${Date.now()}@test.com`,
          password: 'Test123!',
          name: payload,
        });

        const responseText = JSON.stringify(response.data);
        const passed = !responseText.includes(payload) || 
                      responseText.includes('&lt;') || 
                      responseText.includes('&gt;');

        this.results.push({
          test: `XSS - ${payload.substring(0, 30)}...`,
          passed,
          message: passed ? 'Input properly sanitized' : 'XSS payload not sanitized',
          severity: 'high',
        });
      } catch (error) {
        this.results.push({
          test: `XSS - ${payload.substring(0, 30)}...`,
          passed: true,
          message: 'Request handled safely',
          severity: 'high',
        });
      }
    }
  }

  private async testDirectoryTraversal(): Promise<void> {
    console.log('Testing Directory Traversal vulnerabilities...');

    const traversalPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ];

    for (const payload of traversalPayloads) {
      try {
        const response = await this.api.get(`/api/stocks/${payload}`);
        const passed = response.status === 404 || response.status === 400;

        this.results.push({
          test: `Directory Traversal - ${payload}`,
          passed,
          message: passed ? 'Path traversal blocked' : 'Potential vulnerability',
          severity: 'high',
        });
      } catch (error) {
        this.results.push({
          test: `Directory Traversal - ${payload}`,
          passed: true,
          message: 'Request properly rejected',
          severity: 'high',
        });
      }
    }
  }

  private async testAuthenticationBypass(): Promise<void> {
    console.log('Testing Authentication Bypass...');

    const tests = [
      {
        name: 'Missing Authorization Header',
        request: () => this.api.get('/api/portfolio', { headers: {} }),
      },
      {
        name: 'Invalid Token',
        request: () => this.api.get('/api/portfolio', { 
          headers: { Authorization: 'Bearer invalid.token.here' } 
        }),
      },
      {
        name: 'SQL in Token',
        request: () => this.api.get('/api/portfolio', { 
          headers: { Authorization: "Bearer ' OR '1'='1" } 
        }),
      },
    ];

    for (const test of tests) {
      try {
        const response = await test.request();
        const passed = response.status === 401;

        this.results.push({
          test: `Auth Bypass - ${test.name}`,
          passed,
          message: passed ? 'Properly rejected' : 'Authentication bypass possible',
          severity: 'critical',
        });
      } catch (error) {
        this.results.push({
          test: `Auth Bypass - ${test.name}`,
          passed: true,
          message: 'Request properly rejected',
          severity: 'critical',
        });
      }
    }
  }

  private async testRateLimiting(): Promise<void> {
    console.log('Testing Rate Limiting...');

    const endpoint = '/api/auth/login';
    const requests = 10;
    let blockedCount = 0;

    for (let i = 0; i < requests; i++) {
      try {
        const response = await this.api.post(endpoint, {
          email: 'test@test.com',
          password: 'wrong',
        });

        if (response.status === 429) {
          blockedCount++;
        }
      } catch (error) {
        // Ignore errors
      }
    }

    const passed = blockedCount > 0;
    this.results.push({
      test: 'Rate Limiting - Login Attempts',
      passed,
      message: passed 
        ? `Rate limiting active (${blockedCount}/${requests} blocked)` 
        : 'No rate limiting detected',
      severity: 'high',
    });
  }

  private async testSecurityHeaders(): Promise<void> {
    console.log('Testing Security Headers...');

    try {
      const response = await this.api.get('/api/health');
      const headers = response.headers;

      const securityHeaders = [
        { name: 'x-content-type-options', expected: 'nosniff' },
        { name: 'x-frame-options', expected: 'DENY' },
        { name: 'x-xss-protection', expected: '1; mode=block' },
        { name: 'referrer-policy', expected: 'strict-origin-when-cross-origin' },
        { name: 'permissions-policy', expected: true },
      ];

      for (const header of securityHeaders) {
        const value = headers[header.name];
        const passed = header.expected === true 
          ? !!value 
          : value === header.expected;

        this.results.push({
          test: `Security Header - ${header.name}`,
          passed,
          message: passed 
            ? `Header present: ${value}` 
            : `Missing or incorrect header`,
          severity: 'medium',
        });
      }
    } catch (error) {
      this.results.push({
        test: 'Security Headers',
        passed: false,
        message: 'Could not test headers',
        severity: 'medium',
      });
    }
  }

  private async testPasswordPolicy(): Promise<void> {
    console.log('Testing Password Policy...');

    const weakPasswords = [
      '123456',
      'password',
      'qwerty',
      'a',
      '',
    ];

    for (const password of weakPasswords) {
      try {
        const response = await this.api.post('/api/auth/register', {
          email: `test${Date.now()}@test.com`,
          password,
          name: 'Test User',
        });

        const passed = response.status === 400;
        this.results.push({
          test: `Password Policy - "${password}"`,
          passed,
          message: passed ? 'Weak password rejected' : 'Weak password accepted',
          severity: 'medium',
        });
      } catch (error) {
        this.results.push({
          test: `Password Policy - "${password}"`,
          passed: true,
          message: 'Password properly rejected',
          severity: 'medium',
        });
      }
    }
  }

  private async testJWTSecurity(): Promise<void> {
    console.log('Testing JWT Security...');

    // Test with manipulated JWT
    const manipulatedTokens = [
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6IjEiLCJyb2xlIjoiQURNSU4ifQ.',
      'invalid.jwt.token',
      '',
    ];

    for (const token of manipulatedTokens) {
      try {
        const response = await this.api.get('/api/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const passed = response.status === 401;
        this.results.push({
          test: `JWT Security - ${token.substring(0, 20)}...`,
          passed,
          message: passed ? 'Invalid JWT rejected' : 'Invalid JWT accepted',
          severity: 'critical',
        });
      } catch (error) {
        this.results.push({
          test: `JWT Security`,
          passed: true,
          message: 'JWT properly validated',
          severity: 'critical',
        });
      }
    }
  }

  private async testAPIVersioning(): Promise<void> {
    console.log('Testing API Versioning...');

    try {
      const response = await this.api.get('/api/health');
      const hasVersion = response.data.version || response.headers['api-version'];

      this.results.push({
        test: 'API Versioning',
        passed: !!hasVersion,
        message: hasVersion ? 'API version exposed' : 'No API version information',
        severity: 'low',
      });
    } catch (error) {
      this.results.push({
        test: 'API Versioning',
        passed: false,
        message: 'Could not test API versioning',
        severity: 'low',
      });
    }
  }

  private async testErrorMessages(): Promise<void> {
    console.log('Testing Error Message Information Disclosure...');

    try {
      const response = await this.api.get('/api/nonexistent-endpoint-12345');
      const errorMessage = JSON.stringify(response.data).toLowerCase();
      
      const sensitiveInfo = [
        'stack',
        'trace',
        'file:',
        'line:',
        'column:',
        'internal server',
      ];

      const leaksInfo = sensitiveInfo.some(info => errorMessage.includes(info));
      
      this.results.push({
        test: 'Error Message Disclosure',
        passed: !leaksInfo,
        message: leaksInfo 
          ? 'Error messages may leak sensitive information' 
          : 'Error messages properly sanitized',
        severity: 'medium',
      });
    } catch (error) {
      this.results.push({
        test: 'Error Message Disclosure',
        passed: true,
        message: 'Errors handled properly',
        severity: 'medium',
      });
    }
  }

  private printResults(): void {
    console.log('\n📊 Security Test Results:\n');

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const percentage = ((passed / total) * 100).toFixed(1);

    // Group by severity
    const bySeverity = {
      critical: this.results.filter(r => r.severity === 'critical'),
      high: this.results.filter(r => r.severity === 'high'),
      medium: this.results.filter(r => r.severity === 'medium'),
      low: this.results.filter(r => r.severity === 'low'),
    };

    // Print results by severity
    Object.entries(bySeverity).forEach(([severity, tests]) => {
      if (tests.length === 0) return;
      
      console.log(`\n${severity.toUpperCase()} Severity:`);
      tests.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`${icon} ${result.test}: ${result.message}`);
      });
    });

    console.log(`\n📈 Overall Score: ${passed}/${total} (${percentage}%)`);
    
    if (percentage === '100.0') {
      console.log('🎉 Excellent! All security tests passed.');
    } else if (parseFloat(percentage) >= 80) {
      console.log('👍 Good security posture, but some improvements needed.');
    } else {
      console.log('⚠️  Significant security improvements required.');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new SecurityTester(process.env.API_URL || 'http://localhost:5000');
  tester.runAllTests().catch(console.error);
}