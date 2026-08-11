/* ==========================================================================
   Antigravity Agentic Studio - Client Engine (app.js v2.4)
   Live Agent Activity Animation, Terminal-Style Action Stream & Smooth Navigation
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
  const plusBtn = document.getElementById('plus-btn');

  // Active Tool Tag Elements (Gemini Attachment Style)
  const activeToolContainer = document.getElementById('active-tool-container');
  const activeToolIcon = document.getElementById('active-tool-icon');
  const activeToolLabel = document.getElementById('active-tool-label');

  // Popovers
  const actionMenuPopover = document.getElementById('action-menu-popover');
  const commandsPopover = document.getElementById('commands-popover');
  const commandsList = document.getElementById('commands-list');

  // Navbar Controls
  const newChatBtn = document.getElementById('new-chat-btn');
  const drawerNewChatBtn = document.getElementById('drawer-new-chat-btn');
  const voiceModeBtn = document.getElementById('voice-mode-btn');
  const subagentDrawerBtn = document.getElementById('subagent-drawer-btn');
  const subagentBadge = document.getElementById('subagent-badge');
  const subagentCoresContainer = document.getElementById('subagent-cores-container');
  const qrModalBtn = document.getElementById('qr-modal-btn');
  const historyDrawerBtn = document.getElementById('history-drawer-btn');
  const historyDrawer = document.getElementById('history-drawer');
  const closeHistoryDrawerBtn = document.getElementById('close-history-drawer-btn');

  // Backdrop Overlay
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  // Mobile Viewport Switcher
  const mobileTabChat = document.getElementById('mobile-tab-chat');
  const mobileTabCanvas = document.getElementById('mobile-tab-canvas');
  const mobileTabSkills = document.getElementById('mobile-tab-skills');
  const mobileTabTools = document.getElementById('mobile-tab-tools');
  const chatPanel = document.getElementById('chat-panel');
  const canvasPanel = document.getElementById('canvas-panel');

  // Drawers
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const closeSidebarBtn = document.getElementById('close-sidebar-btn');
  const sidebar = document.getElementById('sidebar');
  const sidebarTitle = document.getElementById('sidebar-title');
  const sidebarDrawerContent = document.getElementById('sidebar-drawer-content');
  const settingsSectionBlock = document.getElementById('settings-section-block');
  const closeTasksDrawerBtn = document.getElementById('close-tasks-drawer-btn');
  const tasksDrawer = document.getElementById('tasks-drawer');

  // Canvas Views
  const sandboxIframe = document.getElementById('sandbox-iframe');
  const mermaidContainer = document.getElementById('mermaid-container');
  const inspectFilePathInput = document.getElementById('inspect-file-path');
  const fileContentView = document.getElementById('file-content-view');
  const fileTreeContainer = document.getElementById('file-tree-container');
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
  const modelNameText = document.getElementById('model-name-text');

  // Settings Toggles
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
  let selectedTool = null;

  // Autocomplete Keyboard Navigation State
  let currentCommandMatches = [];
  let selectedCommandIndex = 0;

  // Tool Definitions Dictionary
  const toolDefinitions = {
    'captura': {
      label: 'Captura Android',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
      prefix: 'Ejecuta la habilidad captura para analizar la última captura de pantalla de Android.'
    },
    'clip': {
      label: 'Portapapeles',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2 .84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v2h10V5h2v14z"/></svg>',
      prefix: 'Ejecuta la habilidad clip para leer el contenido de mi portapapeles.'
    },
    'frontend_design': {
      label: 'Frontend Design',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.53 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>',
      prefix: 'Activa la guía de diseño frontend para construir la interfaz.'
    },
    'subagents': {
      label: 'Subagentes',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
      prefix: 'Invoca subagentes en paralelo para procesar esta tarea.'
    },
    'web_app': {
      label: 'Crear App Web',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
      prefix: 'Construye una aplicación web interactiva con HTML, CSS y JavaScript.'
    },
    'mermaid': {
      label: 'Diagrama Mermaid',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 4h2v6h-2z"/></svg>',
      prefix: 'Genera un diagrama Mermaid para visualizar la arquitectura.'
    },
    'audit': {
      label: 'Auditar Proyecto',
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>',
      prefix: 'Inspecciona y audita la estructura de archivos del proyecto actual.'
    }
  };

  // Voice State
  let speechRecognition = null;
  let isDictating = false;
  let isGeminiLiveMode = false;
  let liveMicActive = true;
  let liveSpeakerActive = true;

  // Default System Commands List
  const defaultCommands = [
    { name: '/clear', desc: 'Iniciar nuevo chat y limpiar consola', prompt: '/clear' },
    { name: '/captura', desc: 'Analizar la última captura de pantalla de Android', prompt: 'Ejecuta la habilidad captura' },
    { name: '/clip', desc: 'Leer contenido del portapapeles', prompt: 'Ejecuta la habilidad clip' },
    { name: '/frontend-design', desc: 'Activar guía de diseño frontend premium', prompt: 'Activa la guía de diseño frontend' },
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

  // Render Live Preview Page in Iframe Sandbox if empty
  function renderCanvasDefaultPreview() {
    if (!sandboxIframe) return;
    try {
      const doc = sandboxIframe.contentWindow.document;
      if (!doc.body || doc.body.innerHTML.trim() === '' || doc.location.href === 'about:blank') {
        const defaultHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { background: #12100e; color: #ede6de; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
              .card { background: #1a1714; border: 1px solid rgba(224, 109, 83, 0.3); border-radius: 16px; padding: 28px; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
              h2 { color: #e06d53; margin-top: 0; font-size: 20px; margin-bottom: 10px; }
              p { color: #9e938b; font-size: 13px; line-height: 1.5; margin-bottom: 20px; }
              .pill { display: inline-block; background: rgba(224, 109, 83, 0.15); color: #e59866; border: 1px solid rgba(224, 109, 83, 0.4); padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Antigravity Live Canvas</h2>
              <p>El Sandbox Web interactivo está listo para renderizar código HTML/CSS/JS, diagramas Mermaid y archivos en tiempo real.</p>
              <span class="pill">• Estado: Sandbox Activo</span>
            </div>
          </body>
          </html>
        `;
        doc.open();
        doc.write(defaultHtml);
        doc.close();
      }
    } catch (e) {}
  }

  // New Chat Handler (Reset Conversation & Welcome Screen)
  function startNewChat() {
    currentConversationId = '';
    removeSelectedTool();
    if (chatMessages) {
      chatMessages.innerHTML = '';
      if (welcomeHero) {
        chatMessages.appendChild(welcomeHero);
        welcomeHero.style.display = 'flex';
      }
    }
    if (historyDrawer) historyDrawer.classList.add('collapsed');
    updateBackdropState();
    if (promptInput) {
      promptInput.value = '';
      promptInput.focus();
    }
  }

  if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);
  if (drawerNewChatBtn) drawerNewChatBtn.addEventListener('click', startNewChat);

  // Gemini Tool Selection Handler (Select without immediate sending)
  window.selectToolAttachment = function(key) {
    const tool = toolDefinitions[key] || {
      label: key,
      icon: '<svg class="svg-icon sm" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
      prefix: `Usa la habilidad ${key}.`
    };

    selectedTool = tool;

    if (activeToolContainer && activeToolIcon && activeToolLabel) {
      activeToolIcon.innerHTML = tool.icon;
      activeToolLabel.textContent = tool.label;
      activeToolContainer.classList.remove('hidden');
    }

    if (actionMenuPopover) actionMenuPopover.classList.add('hidden');
    if (plusBtn) plusBtn.classList.remove('active');
    if (promptInput) promptInput.focus();
  };

  window.removeSelectedTool = function() {
    selectedTool = null;
    if (activeToolContainer) activeToolContainer.classList.add('hidden');
  };

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
      if (actionMenuPopover) actionMenuPopover.classList.add('hidden');
      if (plusBtn) plusBtn.classList.remove('active');
      updateBackdropState();
    });
  }

  // Gemini '+' Action Floating Menu Toggle
  if (plusBtn && actionMenuPopover) {
    plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = actionMenuPopover.classList.contains('hidden');
      if (isHidden) {
        actionMenuPopover.classList.remove('hidden');
        plusBtn.classList.add('active');
        if (commandsPopover) commandsPopover.classList.add('hidden');
      } else {
        actionMenuPopover.classList.add('hidden');
        plusBtn.classList.remove('active');
      }
    });

    document.addEventListener('click', (e) => {
      if (!actionMenuPopover.contains(e.target) && !plusBtn.contains(e.target)) {
        actionMenuPopover.classList.add('hidden');
        plusBtn.classList.remove('active');
      }
    });
  }

  // Mobile View Switcher Function
  window.switchMobileView = function(viewName) {
    if (mobileTabChat) mobileTabChat.classList.toggle('active', viewName === 'chat');
    if (mobileTabCanvas) mobileTabCanvas.classList.toggle('active', viewName === 'canvas');
    if (mobileTabSkills) mobileTabSkills.classList.toggle('active', viewName === 'skills');
    if (mobileTabTools) mobileTabTools.classList.toggle('active', viewName === 'tools');

    if (viewName === 'chat') {
      if (chatPanel) {
        chatPanel.classList.add('active-mobile-view');
        chatPanel.style.display = 'flex';
      }
      if (canvasPanel) {
        canvasPanel.classList.remove('active-mobile-view');
        canvasPanel.style.display = 'none';
      }
      if (sidebar) sidebar.classList.add('collapsed');
      if (splitWorkspace) splitWorkspace.classList.remove('canvas-open');
    } else if (viewName === 'canvas') {
      if (chatPanel) {
        chatPanel.classList.remove('active-mobile-view');
        chatPanel.style.display = 'none';
      }
      if (canvasPanel) {
        canvasPanel.classList.add('active-mobile-view');
        canvasPanel.style.display = 'flex';
      }
      if (sidebar) sidebar.classList.add('collapsed');
      if (splitWorkspace) splitWorkspace.classList.add('canvas-open');
      window.switchCanvasTab('iframe');
      renderCanvasDefaultPreview();
    } else if (viewName === 'skills') {
      if (chatPanel) {
        chatPanel.classList.add('active-mobile-view');
        chatPanel.style.display = 'flex';
      }
      if (canvasPanel) {
        canvasPanel.classList.remove('active-mobile-view');
        canvasPanel.style.display = 'none';
      }
      if (sidebar) {
        sidebar.classList.remove('collapsed');
        if (sidebarTitle) sidebarTitle.innerHTML = 'Habilidades';
        if (sidebarDrawerContent) sidebarDrawerContent.scrollTop = 0;
      }
    } else if (viewName === 'tools') {
      if (chatPanel) {
        chatPanel.classList.add('active-mobile-view');
        chatPanel.style.display = 'flex';
      }
      if (canvasPanel) {
        canvasPanel.classList.remove('active-mobile-view');
        canvasPanel.style.display = 'none';
      }
      if (sidebar) {
        sidebar.classList.remove('collapsed');
        if (sidebarTitle) sidebarTitle.innerHTML = 'Ajustes';
        if (settingsSectionBlock) settingsSectionBlock.scrollIntoView({ behavior: 'smooth' });
      }
    }
    updateBackdropState();
  };

  // Dual-Pane Canvas Toggle (Desktop)
  window.toggleCanvasPanel = function() {
    isCanvasOpen = !isCanvasOpen;
    if (splitWorkspace) splitWorkspace.classList.toggle('canvas-open', isCanvasOpen);
    if (isCanvasOpen) renderCanvasDefaultPreview();
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

  // Set Iframe Viewport Width
  window.setIframeViewport = function(width) {
    if (sandboxIframe) {
      sandboxIframe.style.width = width;
    }
  };

  // Autocomplete Popover Logic for '/' Trigger with Keyboard Navigation
  function handleAutocomplete() {
    if (!promptInput || !commandsPopover || !commandsList) return;
    const value = promptInput.value;
    if (value.startsWith('/')) {
      const filter = value.substring(1).toLowerCase().trim();
      
      const allCommands = [
        ...defaultCommands,
        ...allLoadedSkills.map(s => ({
          name: `/${s.name}`,
          desc: s.description,
          prompt: `Usa la habilidad ${s.name} para ejecutar esta tarea`
        }))
      ];

      currentCommandMatches = allCommands.filter(c =>
        c.name.toLowerCase().includes(filter) || c.desc.toLowerCase().includes(filter)
      );

      if (currentCommandMatches.length > 0) {
        selectedCommandIndex = 0;
        renderCommandList();
        commandsPopover.classList.remove('hidden');
        if (actionMenuPopover) actionMenuPopover.classList.add('hidden');
        if (plusBtn) plusBtn.classList.remove('active');
      } else {
        commandsPopover.classList.add('hidden');
      }
    } else {
      commandsPopover.classList.add('hidden');
    }
  }

  function renderCommandList() {
    if (!commandsList) return;
    commandsList.innerHTML = currentCommandMatches.map((c, index) => `
      <div class="command-item touch-target ${index === selectedCommandIndex ? 'selected' : ''}" 
           data-index="${index}"
           onclick="selectCommand('${escapeHtml(c.prompt)}')">
        <div class="command-title">${escapeHtml(c.name)}</div>
        <div class="command-desc">${escapeHtml(c.desc)}</div>
      </div>
    `).join('');

    const selectedEl = commandsList.querySelector('.command-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  window.selectCommand = function(promptText) {
    if (promptInput) promptInput.value = promptText;
    if (commandsPopover) commandsPopover.classList.add('hidden');
    promptInput.focus();
  };

  if (promptInput) {
    promptInput.addEventListener('input', handleAutocomplete);
    
    // Keyboard Navigation Listener for ArrowUp, ArrowDown, Enter, Escape
    promptInput.addEventListener('keydown', (e) => {
      const isPopoverVisible = commandsPopover && !commandsPopover.classList.contains('hidden');
      
      if (isPopoverVisible && currentCommandMatches.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedCommandIndex = (selectedCommandIndex + 1) % currentCommandMatches.length;
          renderCommandList();
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedCommandIndex = (selectedCommandIndex - 1 + currentCommandMatches.length) % currentCommandMatches.length;
          renderCommandList();
          return;
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const match = currentCommandMatches[selectedCommandIndex];
          if (match) {
            selectCommand(match.prompt);
          }
          return;
        } else if (e.key === 'Escape') {
          commandsPopover.classList.add('hidden');
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

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
          <span>${escapeHtml(validLang.toUpperCase())}</span>
          <button class="copy-code-btn" onclick="copyCodeBlock('${codeId}')">
            Copiar
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
        btn.innerHTML = 'Copiado';
        setTimeout(() => {
          btn.innerHTML = 'Copiar';
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

  window.loadFileTree = async function() {
    if (!fileTreeContainer) return;
    try {
      fileTreeContainer.classList.remove('hidden');
      fileTreeContainer.innerHTML = '<div class="tree-item">Cargando árbol...</div>';
      const res = await fetch('/api/tree');
      const data = await res.json();
      const items = data.items || [];
      fileTreeContainer.innerHTML = items.map(item => `
        <div class="tree-item" onclick="selectTreeFile('${escapeHtml(item.path)}')">
          ${item.isDir ? '📁' : '📄'} ${escapeHtml(item.name)}
        </div>
      `).join('');
    } catch (e) {
      fileTreeContainer.innerHTML = '<div class="tree-item">Error al cargar árbol.</div>';
    }
  };

  window.selectTreeFile = function(filePath) {
    if (inspectFilePathInput) {
      inspectFilePathInput.value = filePath;
      inspectFileContent();
    }
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
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

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

  const historyList = document.getElementById('history-list');

  window.toggleTimelineNode = function(nodeId) {
    const nodeEl = document.getElementById(nodeId);
    if (!nodeEl) return;
    nodeEl.classList.toggle('open');
    const toggleBtn = nodeEl.querySelector('.toggle-btn');
    if (toggleBtn) {
      const isOpen = nodeEl.classList.contains('open');
      toggleBtn.innerHTML = isOpen ? 'Mostrar menos' : 'Mostrar todo';
    }
  };

  async function loadChatHistory() {
    if (!historyList) return;
    try {
      historyList.innerHTML = '<div class="skill-skeleton">Cargando historial...</div>';
      const res = await fetch('/api/chats');
      const data = await res.json();
      const chats = data.chats || [];
      if (chats.length === 0) {
        historyList.innerHTML = '<div class="skill-desc">No hay chats guardados.</div>';
        return;
      }
      historyList.innerHTML = chats.map(c => `
        <div class="skill-card touch-target" onclick="resumeChat('${escapeHtml(c.id)}')">
          <div class="skill-title">${escapeHtml(c.prompt)}</div>
          <div class="skill-desc">${new Date(c.date).toLocaleString()}</div>
        </div>
      `).join('');
    } catch (err) {
      historyList.innerHTML = '<div class="skill-desc">Error al cargar historial de chats.</div>';
    }
  }

  window.resumeChat = async function(convId) {
    currentConversationId = convId;
    if (historyDrawer) historyDrawer.classList.add('collapsed');
    updateBackdropState();
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="user-message-card">
          <div class="user-meta">Cargando transcripción...</div>
          <div>Cargando sesión agéntica <code>${escapeHtml(convId)}</code>...</div>
        </div>
      `;
    }
    try {
      const res = await fetch(`/api/chats/transcript?id=${encodeURIComponent(convId)}`);
      const data = await res.json();
      const steps = data.steps || [];
      if (chatMessages) chatMessages.innerHTML = '';
      if (welcomeHero) welcomeHero.style.display = 'none';
      if (steps.length === 0) {
        appendMessage('assistant', `Sesión de chat **${convId}** reanudada. Envía un mensaje para continuar.`);
        return;
      }
      let timelineHtml = '<div class="timeline-stream">';
      steps.forEach((step, index) => {
        const nodeId = `node_${index}_${Math.random().toString(36).substring(2, 7)}`;
        if (step.type === 'USER_INPUT') {
          const text = (step.content || '').replace(/<[^>]+>/g, '').trim();
          if (text) {
            timelineHtml += `
              <div class="user-message-card">
                <div class="user-meta">Usuario</div>
                <div>${escapeHtml(text)}</div>
              </div>
            `;
          }
        } else if (step.type === 'PLANNER_RESPONSE') {
          timelineHtml += `<div class="agent-timeline-container">`;
          
          if (step.thinking) {
            timelineHtml += `
              <div id="${nodeId}" class="timeline-node thinking">
                <div class="timeline-accordion-header" onclick="toggleTimelineNode('${nodeId}')">
                  <div class="title-group">
                    <span>Pensando...</span>
                  </div>
                  <div class="toggle-btn">Mostrar todo</div>
                </div>
                <div class="timeline-accordion-body">${marked.parse(step.thinking)}</div>
              </div>
            `;
          }
          if (step.tool_calls && step.tool_calls.length > 0) {
            step.tool_calls.forEach(tc => {
              timelineHtml += `
                <div class="timeline-node tool">
                  <div class="tool-pill-card">
                    <span><strong>${escapeHtml(tc.name)}</strong>: ${escapeHtml(JSON.stringify(tc.args).substring(0, 80))}</span>
                  </div>
                </div>
              `;
            });
          }
          if (step.content) {
            timelineHtml += `<div class="agent-response-body">${marked.parse(step.content)}</div>`;
          }
          timelineHtml += `</div>`;
        }
      });
      timelineHtml += '</div>';
      chatMessages.innerHTML = timelineHtml;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
      if (chatMessages) {
        chatMessages.innerHTML = `<div class="user-message-card"><div class="user-meta">Error</div><div>No se pudo cargar el historial: ${escapeHtml(err.message)}</div></div>`;
      }
    }
  };

  if (historyDrawerBtn) {
    historyDrawerBtn.addEventListener('click', () => {
      if (historyDrawer) historyDrawer.classList.toggle('collapsed');
      if (sidebar) sidebar.classList.add('collapsed');
      if (tasksDrawer) tasksDrawer.classList.add('collapsed');
      if (historyDrawer && !historyDrawer.classList.contains('collapsed')) {
        loadChatHistory();
      }
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
      <div class="skill-card touch-target" onclick="selectToolAttachment('${escapeHtml(s.name)}')">
        <div class="skill-title">${escapeHtml(s.name)}</div>
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
    const userTypedText = promptInput.value.trim();
    if (!userTypedText && !selectedTool) return;
    if (isGenerating) return;

    if (commandsPopover) commandsPopover.classList.add('hidden');
    if (actionMenuPopover) actionMenuPopover.classList.add('hidden');
    if (plusBtn) plusBtn.classList.remove('active');
    if (welcomeHero) welcomeHero.style.display = 'none';

    let finalPrompt = '';
    let userDisplayMessage = '';

    if (selectedTool) {
      userDisplayMessage = `[${selectedTool.label}] ${userTypedText}`;
      if (userTypedText) {
        finalPrompt = `${selectedTool.prefix} Indicación adicional del usuario: ${userTypedText}`;
      } else {
        finalPrompt = selectedTool.prefix;
      }
    } else {
      userDisplayMessage = userTypedText;
      finalPrompt = userTypedText;
    }

    appendMessage('user', userDisplayMessage);
    promptInput.value = '';
    promptInput.style.height = 'auto';
    playSound('send');

    removeSelectedTool();

    // Create assistant message row
    const assistantRow = createMessageRow('assistant');
    const bubble = assistantRow.querySelector('.msg-bubble');
    
    // Instant Live Working Card Indicator
    const workingCard = document.createElement('div');
    workingCard.className = 'agent-working-card';
    workingCard.innerHTML = `
      <span class="working-dot"></span>
      <span class="working-text">Procesando consulta...</span>
    `;
    bubble.appendChild(workingCard);

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

    const streamUrl = `/api/stream?prompt=${encodeURIComponent(finalPrompt)}&conversation_id=${encodeURIComponent(currentConversationId)}`;
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
            const workingTextEl = workingCard.querySelector('.working-text');
            if (workingTextEl) workingTextEl.textContent = 'Pensando y estructurando plan...';

            if (!thinkingDetailsEl) {
              thinkingDetailsEl = document.createElement('details');
              thinkingDetailsEl.className = 'thinking-block';
              if (expandThinkingToggle && expandThinkingToggle.checked) thinkingDetailsEl.open = true;
              
              const summary = document.createElement('summary');
              summary.className = 'thinking-summary';
              summary.innerHTML = 'Razonamiento del Agente...';
              
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
          const workingTextEl = workingCard.querySelector('.working-text');
          if (workingTextEl) workingTextEl.textContent = `Ejecutando ${toolName}...`;

          const toolBadge = document.createElement('div');
          toolBadge.className = 'tool-badge';
          toolBadge.innerHTML = `Ejecutando ${escapeHtml(toolName)}...`;
          bubble.insertBefore(toolBadge, textContainerEl);
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

          if (workingCard) workingCard.remove();

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
      if (workingCard) workingCard.remove();
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
    avatar.innerHTML = role === 'user' ? 'U' : 'A';
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
