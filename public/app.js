/* ==========================================================================
   Antigravity Agentic Studio - Client Engine (app.js)
   Autocomplete Popover Fixes, Drawer Backdrop & Clean SVG/FontAwesome Icons
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements Selection
  const splitWorkspace = document.getElementById('split-workspace');
  const toggleCanvasBtn = document.getElementById('toggle-canvas-btn');
  const chatMessages = document.getElementById('chat-messages');
  const welcomeHero = document.getElementById('welcome-hero');
  const promptInput = document.getElementById('prompt-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');

  // Autocomplete Popover Elements
  const commandsPopover = document.getElementById('commands-popover');
  const commandsList = document.getElementById('commands-list');

  // Navbar Controls
  const voiceModeBtn = document.getElementById('voice-mode-btn');
  const subagentDrawerBtn = document.getElementById('subagent-drawer-btn');
  const subagentBadge = document.getElementById('subagent-badge');
  const subagentCoresContainer = document.getElementById('subagent-cores-container');
  const qrModalBtn = document.getElementById('qr-modal-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const historyDrawerBtn = document.getElementById('history-drawer-btn');
  const historyDrawer = document.getElementById('history-drawer');
  const closeHistoryDrawerBtn = document.getElementById('close-history-drawer-btn');

  // Backdrop Overlay
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  // Mobile Viewport Switcher Buttons
  const mobileTabChat = document.getElementById('mobile-tab-chat');
  const mobileTabCanvas = document.getElementById('mobile-tab-canvas');
  const mobileTabTools = document.getElementById('mobile-tab-tools');
  const chatPanel = document.getElementById('chat-panel');
  const canvasPanel = document.getElementById('canvas-panel');

  // Drawers
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const closeTasksDrawerBtn = document.getElementById('close-tasks-drawer-btn');
  const tasksDrawer = document.getElementById('tasks-drawer');

  // Canvas Views
  const sandboxIframe = document.getElementById('sandbox-iframe');
  const mermaidContainer = document.getElementById('mermaid-container');
  const inspectFilePathInput = document.getElementById('inspect-file-path');
  const fileContentView = document.getElementById('file-content-view');
  const terminalStdoutLog = document.getElementById('terminal-stdout-log');
  const terminalStdinInput = document.getElementById('terminal-stdin-input');

  // Lists & Modals
  const skillsList = document.getElementById('skills-list');
  const skillsFilterInput = document.getElementById('skills-filter-input');
  const activeSubagentsList = document.getElementById('active-subagents-list');
  const activeTasksList = document.getElementById('active-tasks-list');
  const qrModal = document.getElementById('qr-modal');
  const closeQrModal = document.getElementById('close-qr-modal');
  const ipListContainer = document.getElementById('ip-list-container');
  const sidebarIpInfo = document.getElementById('sidebar-ip-info');
  const modelNameText = document.getElementById('model-name-text');

  // Settings
  const autoScrollToggle = document.getElementById('auto-scroll-toggle');
  const autoTtsToggle = document.getElementById('auto-tts-toggle');
  const expandThinkingToggle = document.getElementById('expand-thinking-toggle');
  const soundFxToggle = document.getElementById('sound-fx-toggle');

  // Voice Overlay (Gemini 3 Flash Live)
  const voiceOverlay = document.getElementById('voice-overlay');
  const closeVoiceOverlayBtn = document.getElementById('close-voice-overlay-btn');
  const voiceOverlayMicToggle = document.getElementById('voice-overlay-mic-toggle');
  const voiceOverlaySpeakerToggle = document.getElementById('voice-overlay-speaker-toggle');
  const voiceUserTranscript = document.getElementById('voice-user-transcript');
  const voiceAiTranscript = document.getElementById('voice-ai-transcript');

  // State
  let currentConversationId = '';
  let activeTaskId = '';
  let activeEventSource = null;
  let isGenerating = false;
  let allLoadedSkills = [];
  let isCanvasOpen = false;

  // Voice State
  let speechRecognition = null;
  let isDictating = false;
  let isGeminiLiveMode = false;
  let liveMicActive = true;
  let liveSpeakerActive = true;

  // Default System Commands List
  const defaultCommands = [
    { name: '/clear', desc: 'Limpiar consola y empezar nuevo chat', prompt: '/clear' },
    { name: '/captura', desc: 'Analizar la última captura de pantalla', prompt: 'Ejecuta la habilidad captura' },
    { name: '/clip', desc: 'Leer contenido del portapapeles', prompt: 'Ejecuta la habilidad clip' },
    { name: '/frontend-design', desc: 'Activar guía de diseño frontend', prompt: 'Activa la guía de diseño frontend' },
    { name: '/subagents', desc: 'Desplegar subagentes en paralelo', prompt: 'Invoca subagentes en paralelo' }
  ];

  // Initialize Mermaid.js
  if (window.mermaid) {
    try {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    } catch (e) {
      console.warn('Mermaid.js init error:', e);
    }
  }

  // Backdrop Manager
  function updateBackdropState() {
    const isSidebarOpen = sidebar && !sidebar.classList.contains('collapsed');
    const isTasksOpen = tasksDrawer && !tasksDrawer.classList.contains('collapsed');
    const isHistoryOpen = historyDrawer && !historyDrawer.classList.contains('collapsed');

    if (drawerBackdrop) {
      if (isSidebarOpen || isTasksOpen || isHistoryOpen) {
        drawerBackdrop.classList.remove('hidden');
      } else {
        drawerBackdrop.classList.add('hidden');
      }
    }
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => {
      if (sidebar) sidebar.classList.add('collapsed');
      if (tasksDrawer) tasksDrawer.classList.add('collapsed');
      if (historyDrawer) historyDrawer.classList.add('collapsed');
      updateBackdropState();
    });
  }

  // Mobile View Switcher Function
  window.switchMobileView = function(viewName) {
    if (mobileTabChat) mobileTabChat.classList.toggle('active', viewName === 'chat');
    if (mobileTabCanvas) mobileTabCanvas.classList.toggle('active', viewName === 'canvas');
    if (mobileTabTools) mobileTabTools.classList.toggle('active', viewName === 'tools');

    if (viewName === 'chat') {
      if (chatPanel) chatPanel.classList.add('active-mobile-view');
      if (canvasPanel) canvasPanel.classList.remove('active-mobile-view');
      if (sidebar) sidebar.classList.add('collapsed');
    } else if (viewName === 'canvas') {
      if (chatPanel) chatPanel.classList.remove('active-mobile-view');
      if (canvasPanel) canvasPanel.classList.add('active-mobile-view');
      if (sidebar) sidebar.classList.add('collapsed');
      if (splitWorkspace) splitWorkspace.classList.add('canvas-open');
    } else if (viewName === 'tools') {
      if (sidebar) sidebar.classList.remove('collapsed');
    }
    updateBackdropState();
  };

  // Dual-Pane Canvas Toggle
  window.toggleCanvasPanel = function() {
    isCanvasOpen = !isCanvasOpen;
    if (splitWorkspace) splitWorkspace.classList.toggle('canvas-open', isCanvasOpen);
  };

  if (toggleCanvasBtn) {
    toggleCanvasBtn.addEventListener('click', window.toggleCanvasPanel);
  }

  // Switch Canvas Tabs
  window.switchCanvasTab = function(tabName) {
    document.querySelectorAll('.canvas-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.canvas-view').forEach(view => view.classList.remove('active'));

    const targetTab = document.getElementById(`tab-btn-${tabName}`);
    const targetView = document.getElementById(`canvas-view-${tabName}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetView) targetView.classList.add('active');
  };

  // Autocomplete Popover Logic for '/' Trigger
  function handleAutocomplete() {
    if (!promptInput || !commandsPopover || !commandsList) return;
    const value = promptInput.value;

    if (value.startsWith('/')) {
      const filter = value.substring(1).toLowerCase().trim();
      
      // Combine default commands and loaded skills
      const allCommands = [
        ...defaultCommands,
        ...allLoadedSkills.map(s => ({
          name: `/${s.name}`,
          desc: s.description,
          prompt: `Usa la habilidad ${s.name} para ejecutar esta tarea`
        }))
      ];

      const matches = allCommands.filter(c =>
        c.name.toLowerCase().includes(filter) || c.desc.toLowerCase().includes(filter)
      );

      if (matches.length > 0) {
        commandsList.innerHTML = matches.map(c => `
          <div class="command-item touch-target" onclick="selectCommand('${escapeHtml(c.prompt)}')">
            <div class="command-title"><i class="fa-solid fa-terminal"></i> ${escapeHtml(c.name)}</div>
            <div class="command-desc">${escapeHtml(c.desc)}</div>
          </div>
        `).join('');
        commandsPopover.classList.remove('hidden');
      } else {
        commandsPopover.classList.add('hidden');
      }
    } else {
      commandsPopover.classList.add('hidden');
    }
  }

  window.selectCommand = function(promptText) {
    if (promptInput) promptInput.value = promptText;
    if (commandsPopover) commandsPopover.classList.add('hidden');
    promptInput.focus();
  };

  if (promptInput) {
    promptInput.addEventListener('input', handleAutocomplete);
  }

  // Quick Skill Triggers Deck Handler
  window.sendQuickTrigger = function(triggerType) {
    const prompts = {
      'captura': 'Ejecuta la habilidad captura para analizar mi última captura de pantalla.',
      'clip': 'Ejecuta la habilidad clip para leer el contenido de mi portapapeles.',
      'frontend-design': 'Activa la guía de diseño frontend para construir la interfaz.',
      'subagents': 'Invoca subagentes en paralelo para procesar esta tarea.'
    };
    const text = prompts[triggerType] || `Ejecuta la habilidad ${triggerType}`;
    if (promptInput) {
      promptInput.value = text;
      sendMessage();
    }
  };

  // Marked Code Highlighting & Auto-Iframe Capture
  const renderer = new marked.Renderer();
  renderer.code = function(code, language) {
    const validLang = (language && hljs.getLanguage(language)) ? language : 'plaintext';
    let highlightedCode = '';
    try {
      highlightedCode = hljs.highlight(code, { language: validLang }).value;
    } catch (e) {
      highlightedCode = escapeHtml(code);
    }

    if (language === 'html' || code.includes('<!DOCTYPE html>') || code.includes('<html')) {
      updateIframeSandbox(code);
    }

    if (language === 'mermaid') {
      renderMermaidDiagram(code);
    }

    const codeId = `code_${Math.random().toString(36).substring(2, 9)}`;
    return `
      <div class="code-wrapper">
        <div class="code-header">
          <span><i class="fa-solid fa-code"></i> ${escapeHtml(validLang.toUpperCase())}</span>
          <button class="copy-code-btn" onclick="copyCodeBlock('${codeId}')">
            <i class="fa-solid fa-copy"></i> Copiar
          </button>
        </div>
        <pre><code id="${codeId}" class="hljs language-${validLang}">${highlightedCode}</code></pre>
      </div>
    `;
  };

  marked.setOptions({
    renderer: renderer,
    breaks: true,
    gfm: true
  });

  window.copyCodeBlock = function(elementId) {
    const codeEl = document.getElementById(elementId);
    if (!codeEl) return;
    const text = codeEl.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = codeEl.closest('.code-wrapper')?.querySelector('.copy-code-btn');
      if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado';
        setTimeout(() => {
          btn.innerHTML = '<i class="fa-solid fa-copy"></i> Copiar';
        }, 2000);
      }
    });
  };

  function renderMermaidDiagram(code) {
    if (!mermaidContainer) return;
    window.switchCanvasTab('mermaid');
    if (!isCanvasOpen) window.toggleCanvasPanel();

    mermaidContainer.innerHTML = `<div class="mermaid">${escapeHtml(code)}</div>`;
    try {
      if (window.mermaid) {
        mermaid.run({ nodes: mermaidContainer.querySelectorAll('.mermaid') });
      }
    } catch (e) {
      console.error('Error renderizando Mermaid:', e);
    }
  }

  function updateIframeSandbox(htmlCode) {
    if (!sandboxIframe) return;
    window.switchCanvasTab('iframe');
    if (!isCanvasOpen) window.toggleCanvasPanel();

    try {
      const doc = sandboxIframe.contentWindow.document;
      doc.open();
      doc.write(htmlCode);
      doc.close();
    } catch (e) {
      console.error('Iframe write error:', e);
    }
  }

  window.refreshIframeSandbox = function() {
    if (sandboxIframe) sandboxIframe.src = sandboxIframe.src;
  };

  window.inspectFileContent = async function() {
    if (!inspectFilePathInput || !fileContentView) return;
    const filePath = inspectFilePathInput.value.trim();
    if (!filePath) return;

    window.switchCanvasTab('diff');
    fileContentView.innerHTML = '<div class="term-line system">[ Cargando archivo... ]</div>';

    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
      const content = await res.text();
      fileContentView.innerHTML = `<pre><code>${escapeHtml(content)}</code></pre>`;
    } catch (e) {
      fileContentView.innerHTML = `<div class="term-line error">[ ERROR ] No se pudo cargar: ${escapeHtml(e.message)}</div>`;
    }
  };

  window.sendTerminalStdin = async function() {
    if (!terminalStdinInput) return;
    const inputVal = terminalStdinInput.value;
    if (!inputVal) return;

    appendTerminalLog(`stdin> ${inputVal}`, 'system');
    terminalStdinInput.value = '';

    try {
      await fetch('/api/terminal/stdin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: activeTaskId, input: inputVal })
      });
    } catch (e) {
      appendTerminalLog(`[ ERROR stdin ]: ${e.message}`, 'error');
    }
  };

  function appendTerminalLog(lineText, type = 'normal') {
    if (!terminalStdoutLog) return;
    const lineEl = document.createElement('div');
    lineEl.className = `term-line ${type}`;
    lineEl.textContent = lineText;
    terminalStdoutLog.appendChild(lineEl);
    terminalStdoutLog.scrollTop = terminalStdoutLog.scrollHeight;
  }

  function playSound(type) {
    if (soundFxToggle && !soundFxToggle.checked) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {}
  }

  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
    });

    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (chatMessages) {
        chatMessages.innerHTML = '';
        if (welcomeHero) {
          chatMessages.appendChild(welcomeHero);
          welcomeHero.style.display = 'block';
        }
      }
      currentConversationId = '';
    });
  }

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      if (sidebar) sidebar.classList.toggle('collapsed');
      if (tasksDrawer) tasksDrawer.classList.add('collapsed');
      if (historyDrawer) historyDrawer.classList.add('collapsed');
      updateBackdropState();
    });
  }

  if (closeSidebarBtn && sidebar) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.add('collapsed');
      updateBackdropState();
    });
  }

  if (subagentDrawerBtn) {
    subagentDrawerBtn.addEventListener('click', () => {
      if (tasksDrawer) tasksDrawer.classList.toggle('collapsed');
      if (sidebar) sidebar.classList.add('collapsed');
      if (historyDrawer) historyDrawer.classList.add('collapsed');
      loadActiveTasks();
      updateBackdropState();
    });
  }

  if (closeTasksDrawerBtn && tasksDrawer) {
    closeTasksDrawerBtn.addEventListener('click', () => {
      tasksDrawer.classList.add('collapsed');
      updateBackdropState();
    });
  }

  if (historyDrawerBtn) {
    historyDrawerBtn.addEventListener('click', () => {
      if (historyDrawer) historyDrawer.classList.toggle('collapsed');
      if (sidebar) sidebar.classList.add('collapsed');
      if (tasksDrawer) tasksDrawer.classList.add('collapsed');
      updateBackdropState();
    });
  }

  if (closeHistoryDrawerBtn && historyDrawer) {
    closeHistoryDrawerBtn.addEventListener('click', () => {
      historyDrawer.classList.add('collapsed');
      updateBackdropState();
    });
  }

  window.sendPresetPrompt = function(text) {
    if (promptInput) {
      promptInput.value = text;
      sendMessage();
    }
  };

  async function loadSkills() {
    if (!skillsList) return;
    try {
      const res = await fetch('/api/skills');
      const data = await res.json();
      allLoadedSkills = data.skills || [];
      renderSkills(allLoadedSkills);
    } catch (err) {
      skillsList.innerHTML = '<div class="skill-desc">Error al cargar habilidades.</div>';
    }
  }

  function renderSkills(skills) {
    if (!skillsList) return;
    if (!skills || skills.length === 0) {
      skillsList.innerHTML = '<div class="skill-desc">No hay habilidades registradas.</div>';
      return;
    }

    skillsList.innerHTML = skills.map(s => `
      <div class="skill-card touch-target" onclick="sendPresetPrompt('Usa la habilidad ${escapeHtml(s.name)} para ejecutar esta tarea')">
        <div class="skill-title"><i class="fa-solid fa-cube"></i> ${escapeHtml(s.name)}</div>
        <div class="skill-desc">${escapeHtml(s.description)}</div>
      </div>
    `).join('');
  }

  if (skillsFilterInput) {
    skillsFilterInput.addEventListener('input', () => {
      const query = skillsFilterInput.value.toLowerCase().trim();
      if (!query) {
        renderSkills(allLoadedSkills);
        return;
      }
      const filtered = allLoadedSkills.filter(s =>
        s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query)
      );
      renderSkills(filtered);
    });
  }

  async function loadNetworkInfo() {
    if (!ipListContainer) return;
    try {
      const res = await fetch('/api/info');
      const info = await res.json();

      if (info.model && modelNameText) modelNameText.textContent = info.model;

      let html = `<div class="ip-item">
        <span>http://localhost:${info.port}</span>
        <button class="warm-btn sm touch-target" onclick="navigator.clipboard.writeText('http://localhost:${info.port}')">Copiar</button>
      </div>`;

      if (info.localIPs && info.localIPs.length > 0) {
        info.localIPs.forEach(ip => {
          const url = `http://${ip}:${info.port}`;
          html += `<div class="ip-item">
            <span>${url}</span>
            <button class="warm-btn sm touch-target" onclick="navigator.clipboard.writeText('${url}')">Copiar</button>
          </div>`;
        });
        if (sidebarIpInfo) sidebarIpInfo.textContent = `http://${info.localIPs[0]}:${info.port}`;
      }
      ipListContainer.innerHTML = html;
    } catch (err) {
      ipListContainer.innerHTML = '<div>Error leyendo direcciones de red</div>';
    }
  }

  if (qrModalBtn) {
    qrModalBtn.addEventListener('click', () => {
      loadNetworkInfo();
      if (qrModal) qrModal.classList.add('active');
    });
  }

  if (closeQrModal && qrModal) {
    closeQrModal.addEventListener('click', () => qrModal.classList.remove('active'));
  }

  async function loadActiveTasks() {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const tasks = data.tasks || [];

      if (tasks.length > 0) {
        if (subagentBadge) {
          subagentBadge.textContent = tasks.length;
          subagentBadge.classList.remove('hidden');
        }

        if (subagentCoresContainer) {
          let coresHtml = '';
          tasks.forEach((t, index) => {
            const statusClass = t.status === 'running' ? 'running' : 'done';
            coresHtml += `<div class="core-node ${statusClass}"><span class="core-dot"></span> Core_0${index+1} [${t.status.toUpperCase()}]</div>`;
          });
          subagentCoresContainer.innerHTML = coresHtml;
        }

        if (activeTasksList) {
          activeTasksList.innerHTML = tasks.map(t => `
            <div class="skill-card">
              <div class="skill-title">PID ${t.pid} - ${t.status}</div>
              <div class="skill-desc">${escapeHtml(t.prompt.substring(0, 60))}...</div>
            </div>
          `).join('');
        }
      } else {
        if (subagentBadge) subagentBadge.classList.add('hidden');
        if (subagentCoresContainer) subagentCoresContainer.innerHTML = '<div class="core-node idle"><span class="core-dot"></span> Core_01 [IDLE]</div>';
        if (activeTasksList) activeTasksList.innerHTML = '<div class="empty-tasks">No hay subagentes secundarios activos.</div>';
      }
    } catch (err) {}
  }

  async function sendMessage() {
    if (!promptInput) return;
    const text = promptInput.value.trim();
    if (!text || isGenerating) return;

    if (commandsPopover) commandsPopover.classList.add('hidden');
    if (welcomeHero) welcomeHero.style.display = 'none';

    appendMessage('user', text);
    promptInput.value = '';
    promptInput.style.height = 'auto';
    playSound('send');

    const assistantRow = createMessageRow('assistant');
    const bubble = assistantRow.querySelector('.msg-bubble');
    if (chatMessages) chatMessages.appendChild(assistantRow);
    scrollToBottom();

    isGenerating = true;

    let fullText = '';
    let currentThinkingText = '';
    let thinkingDetailsEl = null;
    let thinkingContentEl = null;
    let textContainerEl = document.createElement('div');
    textContainerEl.className = 'text-content';
    bubble.appendChild(textContainerEl);

    const streamUrl = `/api/stream?prompt=${encodeURIComponent(text)}&conversation_id=${encodeURIComponent(currentConversationId)}`;
    const eventSource = new EventSource(streamUrl);
    activeEventSource = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.conversation_id) {
          currentConversationId = data.conversation_id;
        }

        if (data.task_id) {
          activeTaskId = data.task_id;
        }

        const step = data.step_update || data;

        if (step.thinking_delta || step.thinking || data.event === 'thinking') {
          const thinkChunk = step.thinking_delta || step.thinking || step.text || '';
          if (thinkChunk) {
            if (!thinkingDetailsEl) {
              thinkingDetailsEl = document.createElement('details');
              thinkingDetailsEl.className = 'thinking-block';
              if (expandThinkingToggle && expandThinkingToggle.checked) thinkingDetailsEl.open = true;

              const summary = document.createElement('summary');
              summary.className = 'thinking-summary';
              summary.innerHTML = '<i class="fa-solid fa-brain"></i> Razonamiento del Agente...';

              thinkingContentEl = document.createElement('div');
              thinkingContentEl.className = 'thinking-content';

              thinkingDetailsEl.appendChild(summary);
              thinkingDetailsEl.appendChild(thinkingContentEl);
              bubble.insertBefore(thinkingDetailsEl, textContainerEl);
            }
            currentThinkingText += thinkChunk;
            thinkingContentEl.textContent = currentThinkingText;
          }
        }

        if (step.step_type === 'tool_call' || step.tool_call || data.event === 'tool_start') {
          const toolName = step.tool_name || (step.tool_call && step.tool_call.name) || 'Herramienta';
          const toolBadge = document.createElement('div');
          toolBadge.className = 'tool-badge';
          toolBadge.innerHTML = `<i class="fa-solid fa-gear fa-spin"></i> Ejecutando ${escapeHtml(toolName)}...`;
          bubble.appendChild(toolBadge);
          loadActiveTasks();
          appendTerminalLog(`[ EXEC TOOL ]: ${toolName}`, 'system');
        }

        if (step.text_delta || step.token || data.event === 'token' || step.response) {
          const tokenChunk = step.text_delta || step.token || step.response || '';
          fullText += tokenChunk;
          textContainerEl.innerHTML = marked.parse(fullText);

          if (isGeminiLiveMode && voiceAiTranscript) {
            voiceAiTranscript.textContent = fullText.replace(/```[\s\S]*?```/g, '');
          }
        }

        if (data.event === 'done') {
          eventSource.close();
          isGenerating = false;
          playSound('receive');

          if (autoTtsToggle && autoTtsToggle.checked && fullText && !isGeminiLiveMode) {
            speakText(fullText.replace(/```[\s\S]*?```/g, ' Código omitido. '));
          }

          if (isGeminiLiveMode && liveSpeakerActive && fullText) {
            speakText(fullText.replace(/```[\s\S]*?```/g, ''), () => {
              if (isGeminiLiveMode && speechRecognition && liveMicActive) {
                try { speechRecognition.start(); } catch (e) {}
              }
            });
          }
        }

        if (autoScrollToggle && autoScrollToggle.checked) scrollToBottom();

      } catch (err) {
        console.error('Error parseando SSE:', err);
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      isGenerating = false;
    };
  }

  // Gemini 3 Flash Live Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'es-ES';

    speechRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (isGeminiLiveMode && voiceUserTranscript) {
        voiceUserTranscript.textContent = transcript;
      } else if (promptInput) {
        promptInput.value = transcript;
      }
    };

    speechRecognition.onend = () => {
      isDictating = false;
      if (micBtn) micBtn.classList.remove('listening');

      if (isGeminiLiveMode && voiceUserTranscript && voiceUserTranscript.textContent && voiceUserTranscript.textContent !== 'Escuchando...') {
        if (promptInput) promptInput.value = voiceUserTranscript.textContent;
        sendMessage();
        voiceUserTranscript.textContent = 'Procesando en Gemini 3 Flash Live...';
      }
    };

    if (micBtn) {
      micBtn.addEventListener('click', () => {
        if (isDictating) {
          speechRecognition.stop();
        } else {
          speechRecognition.start();
          isDictating = true;
          micBtn.classList.add('listening');
        }
      });
    }
  } else if (micBtn) {
    micBtn.style.display = 'none';
  }

  function speakText(text, onEndCallback) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.05;

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  }

  if (voiceModeBtn) {
    voiceModeBtn.addEventListener('click', () => {
      isGeminiLiveMode = true;
      if (voiceOverlay) voiceOverlay.classList.remove('hidden');
      if (voiceUserTranscript) voiceUserTranscript.textContent = 'Escuchando tu voz...';
      if (voiceAiTranscript) voiceAiTranscript.textContent = 'Gemini 3 Flash Live listo.';

      if (speechRecognition && liveMicActive) {
        try { speechRecognition.start(); } catch (e) {}
      }
    });
  }

  if (closeVoiceOverlayBtn) {
    closeVoiceOverlayBtn.addEventListener('click', () => {
      isGeminiLiveMode = false;
      if (voiceOverlay) voiceOverlay.classList.add('hidden');
      if (speechRecognition) speechRecognition.stop();
      window.speechSynthesis.cancel();
    });
  }

  if (voiceOverlayMicToggle) {
    voiceOverlayMicToggle.addEventListener('click', () => {
      liveMicActive = !liveMicActive;
      if (!liveMicActive && speechRecognition) speechRecognition.stop();
      else if (liveMicActive && speechRecognition) try { speechRecognition.start(); } catch (e) {}
    });
  }

  if (voiceOverlaySpeakerToggle) {
    voiceOverlaySpeakerToggle.addEventListener('click', () => {
      liveSpeakerActive = !liveSpeakerActive;
      if (!liveSpeakerActive) window.speechSynthesis.cancel();
    });
  }

  function appendMessage(role, text) {
    const row = createMessageRow(role);
    const bubble = row.querySelector('.msg-bubble');
    if (role === 'user') {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = marked.parse(text);
    }
    if (chatMessages) chatMessages.appendChild(row);
    scrollToBottom();
  }

  function createMessageRow(role) {
    const row = document.createElement('div');
    row.className = `msg-row ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = role === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-bolt"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    if (role === 'user') {
      row.appendChild(bubble);
      row.appendChild(avatar);
    } else {
      row.appendChild(avatar);
      row.appendChild(bubble);
    }

    return row;
  }

  function scrollToBottom() {
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  loadSkills();
  loadNetworkInfo();
  loadActiveTasks();
  setInterval(loadActiveTasks, 10000);
});
