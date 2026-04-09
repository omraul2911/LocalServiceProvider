const { execSync } = require('child_process');

try {
  const output = execSync('netstat -ano | findstr :5000').toString();
  const lines = output.split('\n').map(l => l.trim()).filter(l => l);
  const pids = new Set();
  lines.forEach(line => {
    const parts = line.split(/\s+/);
    if(parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if(pid !== '0') pids.add(pid);
    }
  });

  pids.forEach(pid => {
    try {
      console.log(`Killing PID ${pid}...`);
      execSync(`taskkill /F /PID ${pid}`);
    } catch(e) {}
  });
} catch(e) {
  console.log("No process found on 5000.");
}
