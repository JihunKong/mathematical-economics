module.exports = {
  apps: [{
    name: 'backend',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    // 모니터링 설정
    instance_var: 'INSTANCE_ID',
    merge_logs: true,
    // 자동 재시작 조건
    cron_restart: '0 4 * * *', // 매일 새벽 4시 재시작
    // 메모리 및 CPU 모니터링
    monitoring: true,
    // 그레이스풀 종료
    kill_timeout: 5000,
    listen_timeout: 3000,
    // 환경변수
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      PYTHON_PATH: '/usr/bin/python3'
    }
  }]
};