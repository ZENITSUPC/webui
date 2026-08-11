/* ==========================================================================
   Antigravity Agentic Studio - Backend Bridge (server.js)
   Node.js Server with SSE Streaming, Gemini 3 Flash Live API & Terminal stdin
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Gemini 3 Flash Live API Configuration
const GEMINI_LIVE_API_KEY = process.env.GEMINI_API_KEY || "api_key";

const activeTasks = new Map();
const activeProcesses = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' === iface.family && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

function getSkillsList() {
  const possibleDirs = [
    '/root/.agents/skills',
    path.join(os.homedir(), '.agents', 'skills'),
    path.join(process.cwd(), '.agents', 'skills')
  ];

  const skillsMap = new Map();

  for (const skillsDir of possibleDirs) {
    try {
      if (!fs.existsSync(skillsDir)) continue;
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillName = entry.name;
        if (skillsMap.has(skillName)) continue;

        const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
        let description = 'Habilidad modular de Antigravity';

        if (fs.existsSync(skillFile)) {
          const content = fs.readFileSync(skillFile, 'utf-8');
          const descMatch = content.match(/description:\s*(.+)/i);
          if (descMatch) description = descMatch[1].trim();

          const nameMatch = content.match(/name:\s*(.+)/i);
          const name = nameMatch ? nameMatch[1].trim() : skillName;

          skillsMap.set(skillName, {
            name: name,
            folder: skillName,
            description: description,
            path: skillFile
          });
        }
      }
    } catch (err) {
      console.error(`Error leyendo skills en ${skillsDir}:`, err.message);
    }
  }

  return Array.from(skillsMap.values());
}

function getActiveTasksList() {
  const tasks = [];
  for (const [id, task] of activeTasks.entries()) {
    tasks.push({
      id,
      prompt: task.prompt,
      startTime: task.startTime,
      status: task.status,
      pid: task.pid,
      subagents: task.subagents || []
    });
  }
  return tasks;
}

function getAgyExecutablePath() {
  const candidates = [
    '/root/.local/bin/agy',
    path.join(os.homedir(), '.local', 'bin', 'agy'),
    '/usr/local/bin/agy',
    '/usr/bin/agy'
  ];

  for (const binPath of candidates) {
    if (fs.existsSync(binPath)) {
      return binPath;
    }
  }

  try {
    const whichPath = execSync('which agy', { encoding: 'utf-8' }).trim();
    if (whichPath) return whichPath;
  } catch (e) { }

  return 'agy';
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // REST API: Get active skills
  if (pathname === '/api/skills' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ skills: getSkillsList() }));
    return;
  }

  // REST API: Server & Network status info
  if (pathname === '/api/info' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      agentEngine: 'Antigravity Studio Engine (agy)',
      model: 'Gemini 3 Flash Live (Voice Engine)',
      localIPs: getLocalIPs(),
      port: PORT,
      os: `${os.type()} ${os.release()} (${os.arch()})`,
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version
    }));
    return;
  }

  // REST API: Gemini 3 Flash Live API Config Endpoint
  if (pathname === '/api/live/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      model: 'gemini-3-flash-live',
      hasApiKey: !!GEMINI_LIVE_API_KEY,
      apiKey: GEMINI_LIVE_API_KEY
    }));
    return;
  }

  // REST API: Get active subagents and running tasks
  if (pathname === '/api/tasks' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tasks: getActiveTasksList() }));
    return;
  }

  // REST API: Terminal Stdin Control
  if (pathname === '/api/terminal/stdin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { taskId, input } = JSON.parse(body || '{}');
        const child = activeProcesses.get(taskId);
        if (child && child.stdin && !child.stdin.destroyed) {
          child.stdin.write(input + '\n');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'sent', input }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Proceso de terminal no encontrado o cerrado' }));
        }
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON invalido' }));
      }
    });
    return;
  }

  // REST API: File Content Preview Reader
  if (pathname === '/api/file' && req.method === 'GET') {
    const filePathParam = parsedUrl.searchParams.get('path');
    if (!filePathParam) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Parametro path requerido.');
      return;
    }

    try {
      const resolvedPath = path.resolve(filePathParam);
      if (fs.existsSync(resolvedPath)) {
        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'text/plain; charset=utf-8';
        const content = fs.readFileSync(resolvedPath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Archivo no encontrado');
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error leyendo archivo: ${e.message}`);
    }
    return;
  }

  // STREAM API: Server-Sent Events (SSE)
  if (pathname === '/api/stream' && (req.method === 'GET' || req.method === 'POST')) {
    let prompt = parsedUrl.searchParams.get('prompt') || '';
    let conversationId = parsedUrl.searchParams.get('conversation_id') || '';

    const handleStreamRequest = (pPrompt, pConvId) => {
      const finalPrompt = pPrompt || prompt;
      const finalConvId = pConvId || conversationId;

      if (!finalPrompt || !finalPrompt.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'El parámetro prompt es requerido.' }));
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      const agyBin = getAgyExecutablePath();
      const taskId = `task_${Date.now()}`;

      const args = [
        '-p', finalPrompt.trim(),
        '--output-format', 'stream-json',
        '--dangerously-skip-permissions'
      ];

      if (finalConvId) {
        args.push('--conversation', finalConvId.trim());
      }

      console.log(`[AGY EXEC] Bin: ${agyBin} | Task: ${taskId} | Conv: ${finalConvId || 'New'}`);

      const child = spawn(agyBin, args, {
        cwd: os.homedir(),
        env: { ...process.env, PYTHONUNBUFFERED: '1', GEMINI_API_KEY: GEMINI_LIVE_API_KEY }
      });

      activeProcesses.set(taskId, child);

      activeTasks.set(taskId, {
        prompt: finalPrompt,
        startTime: new Date().toISOString(),
        status: 'running',
        pid: child.pid,
        process: child,
        subagents: []
      });

      res.write(`data: ${JSON.stringify({
        event: 'init',
        task_id: taskId,
        conversation_id: finalConvId || taskId
      })}\n\n`);

      let buffer = '';

      child.stdout.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);

            if (parsed.event === 'subagent_start' || parsed.step_update?.tool_name === 'invoke_subagent') {
              const taskObj = activeTasks.get(taskId);
              if (taskObj) {
                const subagentName = parsed.subagent || parsed.step_update?.tool_call?.args?.task || 'Subagente';
                taskObj.subagents.push({ name: subagentName, status: 'RUNNING', time: new Date().toISOString() });
              }
            }

            const sseEvent = {
              event: parsed.event || parsed.type || 'step_update',
              step_update: parsed.step_update || parsed,
              conversation_id: parsed.conversation_id || finalConvId || taskId,
              task_id: taskId,
              raw: parsed
            };

            res.write(`data: ${JSON.stringify(sseEvent)}\n\n`);
          } catch (e) {
            res.write(`data: ${JSON.stringify({
              event: 'step_update',
              step_update: { text_delta: trimmed + '\n' },
              conversation_id: finalConvId || taskId,
              task_id: taskId
            })}\n\n`);
          }
        }
      });

      child.stderr.on('data', (errChunk) => {
        const errStr = errChunk.toString();
        console.error(`[AGY STDERR ${taskId}]:`, errStr);
        res.write(`data: ${JSON.stringify({
          event: 'stderr',
          text: errStr,
          task_id: taskId
        })}\n\n`);
      });

      child.on('close', (code) => {
        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer.trim());
            res.write(`data: ${JSON.stringify({
              event: parsed.event || 'step_update',
              step_update: parsed.step_update || parsed
            })}\n\n`);
          } catch (e) {
            res.write(`data: ${JSON.stringify({
              event: 'step_update',
              step_update: { text_delta: buffer.trim() }
            })}\n\n`);
          }
        }

        const task = activeTasks.get(taskId);
        if (task) {
          task.status = code === 0 ? 'completed' : 'failed';
          setTimeout(() => activeTasks.delete(taskId), 30000);
        }
        activeProcesses.delete(taskId);

        res.write(`data: ${JSON.stringify({
          event: 'done',
          exitCode: code,
          task_id: taskId,
          conversation_id: finalConvId || taskId
        })}\n\n`);

        res.end();
      });

      child.on('error', (err) => {
        console.error(`[AGY ERROR ${taskId}]:`, err.message);
        res.write(`data: ${JSON.stringify({
          event: 'error',
          message: `Error ejecutando agy CLI: ${err.message}`
        })}\n\n`);
        res.end();
      });

      req.on('close', () => {
        if (child && !child.killed) {
          console.log(`[AGY KILL] Cliente desconectado. Deteniendo ${child.pid}...`);
          child.kill('SIGTERM');
        }
      });
    };

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const jsonBody = JSON.parse(body || '{}');
          handleStreamRequest(jsonBody.prompt, jsonBody.conversation_id);
        } catch (e) {
          handleStreamRequest(prompt, conversationId);
        }
      });
    } else {
      handleStreamRequest(prompt, conversationId);
    }
    return;
  }

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Prohibido');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2>404 Recurso no encontrado</h2>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error de servidor: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIPs();
  console.log('\n===========================================================');
  console.log(`🚀  ANTIGRAVITY STUDIO - GEMINI 3 FLASH LIVE ENGINE ONLINE`);
  console.log(`📡  Acceso Local (Termux/PC): http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`📱  Acceso Wi-Fi Móvil:      http://${ip}:${PORT}`);
  });
  console.log('===========================================================\n');
});
