const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'My Node Print Server',
  description: 'Background service for the local print server.',
  script: require('path').join(__dirname, 'server.js') // Point this to your main script
});

// Listen for the "install" event, which indicates the process is available as a service.
svc.on('install', function() {
  svc.start();
  console.log('Service installed and started successfully!');
});

// Install the script as a service
svc.install();