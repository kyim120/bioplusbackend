module.exports = {
  apps: [{
    name: 'bio-plus-backend',
    script: 'server.js',
    instances: 'max', // Use all available CPU cores in production
    exec_mode: 'cluster', // Enable cluster mode for better performance
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs'], // Ignore these directories when watching
    max_memory_restart: '1G',
    restart_delay: 4000, // Delay between restarts
    min_uptime: '10s', // Minimum uptime before considering restart successful
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Enhanced monitoring
    max_restarts: 10, // Maximum number of restart attempts
    kill_timeout: 5000, // Time to wait before killing the process
    // PM2 monitoring
    vizion: false, // Disable vizion for better performance
    // Additional logging
    log_rotate_file: true, // Enable log rotation
    log_rotate_max_size: '10M', // Max size per log file
    log_rotate_compress: true // Compress rotated logs
  }]
};
