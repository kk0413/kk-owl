const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const toast = (message) => {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
};

const overlay = $('#platformOverlay');
const openPlatform = () => {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closePlatform = () => {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
$('#openPlatform').addEventListener('click', openPlatform);
$('#closePlatform').addEventListener('click', closePlatform);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closePlatform();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay.classList.contains('open')) closePlatform();
});

let isPlaying = false;
let elapsed = 0;
let playbackTimer;
const progress = $('#progressBar');
const timeLabel = $('#timeLabel');
const playButton = $('#playButton');
const formatTime = (seconds) => `00:${String(Math.min(59, seconds)).padStart(2, '0')}`;
const renderPlayback = () => {
  progress.style.width = `${Math.max(8, Math.min(100, (elapsed / 88) * 100))}%`;
  timeLabel.textContent = formatTime(elapsed);
  playButton.innerHTML = isPlaying ? '<span class="pause-bars"><i></i><i></i></span>' : '<span class="play-triangle"></span>';
};
const togglePlayback = () => {
  isPlaying = !isPlaying;
  toast(isPlaying ? '视频开始播放' : '视频已暂停');
  window.clearInterval(playbackTimer);
  if (isPlaying) playbackTimer = window.setInterval(() => {
    elapsed = elapsed >= 88 ? 0 : elapsed + 1;
    renderPlayback();
  }, 1000);
  renderPlayback();
};
playButton.addEventListener('click', togglePlayback);
$('#soundButton').addEventListener('click', (event) => {
  event.currentTarget.textContent = event.currentTarget.textContent === '⌁' ? '⌁̸' : '⌁';
  toast(event.currentTarget.textContent.includes('̸') ? '已静音' : '已开启声音');
});

$$('.social-action').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'like') {
      const count = $('#likeCount');
      const liked = button.classList.toggle('active');
      count.textContent = liked ? '35' : '34';
      toast(liked ? '已点赞' : '已取消点赞');
    } else if (action === 'favorite') {
      const count = $('#favoriteCount');
      const saved = button.classList.toggle('active');
      count.textContent = saved ? '13' : '12';
      toast(saved ? '已收藏到稍后再看' : '已取消收藏');
    } else if (action === 'share') {
      toast('分享链接已复制');
    } else if (action === 'comment') {
      toast('评论区将在产品版中展开');
    }
  });
});

const panelTitles = { overview: '总览', model: '本体建模', agents: '本体智能体', reports: '智能报告', knowledge: '企业知识' };
$$('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = button.dataset.panel;
    $$('.nav-item').forEach((item) => item.classList.toggle('active', item === button));
    $$('.panel-view').forEach((view) => view.classList.toggle('active', view.dataset.view === panel));
    $('#breadcrumbTitle').textContent = panelTitles[panel];
  });
});

$$('[data-toast]').forEach((button) => button.addEventListener('click', () => toast(button.dataset.toast)));

$$('.entity-card').forEach((card) => {
  card.addEventListener('click', () => {
    $$('.entity-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    $('#entityName').textContent = card.dataset.entity;
    toast(`已选中实体：${card.dataset.entity}`);
  });
});

$('#generateReport').addEventListener('click', () => {
  const status = $('#reportStatus');
  status.textContent = '生成中';
  toast('正在基于本体关系生成报告…');
  window.setTimeout(() => {
    status.textContent = '已完成';
    toast('报告已生成，可查看完整内容');
  }, 1700);
});

const knowledgeInput = $('#knowledgeInput');
knowledgeInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  $$('.knowledge-item', $('#knowledgeItems')).forEach((item) => {
    const matches = !query || item.dataset.search.toLowerCase().includes(query);
    item.style.display = matches ? 'grid' : 'none';
    if (matches) visible += 1;
  });
  $('#knowledgeResultHint').textContent = query ? `找到 ${visible} 条匹配内容` : '共 1,248 条知识内容';
});

$('#platformSearch').addEventListener('click', () => {
  const currentPanel = $('.panel-view.active')?.dataset.view;
  if (currentPanel !== 'knowledge') {
    $('.nav-item[data-panel="knowledge"]').click();
  }
  knowledgeInput.focus();
  toast('已切换到企业知识搜索');
});
$('#helpButton').addEventListener('click', () => toast('这是 JBoltAI 本体语义平台演示页'));
renderPlayback();

// 文档到本体的演示流程：只模拟解析与写入，不执行真实文件上传。
const importModal = $('#importModal');
const importStages = $$('[data-import-stage]');
const importSteps = $$('.import-step');
const setImportStage = (stage) => {
  importStages.forEach((item) => item.classList.toggle('active', item.dataset.importStage === stage));
  const stepByStage = { upload: 1, analyzing: 2, preview: 3, success: 3 };
  const current = stepByStage[stage];
  importSteps.forEach((item) => item.classList.toggle('active', Number(item.dataset.step) <= current));
};
const openImport = () => {
  setImportStage('upload');
  importModal.classList.add('open');
  importModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeImport = () => {
  importModal.classList.remove('open');
  importModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
};
$('#openImport').addEventListener('click', openImport);
$('#closeImport').addEventListener('click', closeImport);
importModal.addEventListener('click', (event) => {
  if (event.target === importModal) closeImport();
});

let analysisTimer;
const startDemoImport = () => {
  setImportStage('analyzing');
  const progressBar = $('#analysisProgress');
  const percent = $('#analysisPercent');
  const message = $('#analysisMessage');
  const messages = ['读取文档结构与语义上下文…', '识别项目、客户与交付物实体…', '推理业务关系与属性字段…', '生成可视化本体结构…'];
  let value = 0;
  window.clearInterval(analysisTimer);
  analysisTimer = window.setInterval(() => {
    value += 8;
    progressBar.style.width = `${Math.min(value, 100)}%`;
    percent.textContent = `${Math.min(value, 100)}%`;
    message.textContent = messages[Math.min(Math.floor(value / 27), messages.length - 1)];
    if (value >= 100) {
      window.clearInterval(analysisTimer);
      window.setTimeout(() => setImportStage('preview'), 300);
    }
  }, 95);
};
$('#demoFilePick').addEventListener('click', startDemoImport);
$('#useDemoFile').addEventListener('click', startDemoImport);

$('#confirmOntology').addEventListener('click', () => {
  setImportStage('success');
  toast('本体已创建，正在同步到工作空间');
  const autoAssociate = $('#autoAssociate').checked;
  if (autoAssociate) {
    const knowledgeItems = $('#knowledgeItems');
    if (!$('#importedKnowledge')) {
      const item = document.createElement('div');
      item.id = 'importedKnowledge';
      item.className = 'knowledge-item imported-knowledge';
      item.dataset.search = '2026交付项目手册 自动创建本体 项目文档';
      item.innerHTML = '<span class="file-icon purple">DOC</span><div><strong>2026 交付项目手册 · 本体索引</strong><p>项目文档 · 已关联 8 个实体与 16 条关系</p></div><span>刚刚</span><span>•••</span>';
      knowledgeItems.prepend(item);
    }
  }
});

$('#viewImportedModel').addEventListener('click', () => {
  closeImport();
  $('.nav-item[data-panel="model"]').click();
  const graph = $('.interactive-graph');
  if (!graph.querySelector('.entity-imported')) {
    const imported = document.createElement('button');
    imported.className = 'entity-card entity-imported';
    imported.dataset.entity = '交付物';
    imported.innerHTML = '<span class="entity-type">IMPORTED ENTITY</span><strong>交付物</strong><small>Deliverable · 8 个属性</small>';
    graph.appendChild(imported);
  }
  toast('已打开更新后的本体建模画布');
});

$('.interactive-graph').addEventListener('click', (event) => {
  const card = event.target.closest('.entity-card.entity-imported');
  if (!card) return;
  $$('.entity-card').forEach((item) => item.classList.remove('selected'));
  card.classList.add('selected');
  $('#entityName').textContent = card.dataset.entity;
  toast(`已选中导入实体：${card.dataset.entity}`);
});

// 智能体演示工作区：展示选择智能体、快速提问与示例洞察结果。
const agentModal = $('#agentModal');
const agentInput = $('#agentInput');
const agentData = {
  insight: { name: '洞察引擎', icon: '✦', subline: '发现趋势、异常与潜在机会，生成可追溯的业务洞察。', context: '销售业务本体 · 企业知识', calls: '238', response: '基于客户、项目和交付物之间的语义关系，我发现华东区域有 3 个高风险客户。主要信号集中在续约周期 30 天内，建议优先查看「星河科技」与「远航制造」。', result: [['3', '高风险客户'], ['12.4%', '流失率环比'], ['2', '挽回路径']] },
  customer: { name: '客户雷达', icon: '⌁', subline: '关联客户、项目与服务记录，识别客户健康度与流失风险。', context: '客户本体 · 服务知识', calls: '186', response: '客户雷达已完成健康度扫描：星河科技当前评分 62，近 30 天交付响应下降 18%；远航制造评分 68，存在 2 个未闭环服务问题。', result: [['62', '星河科技健康度'], ['18%', '响应下降'], ['2', '未闭环问题']] },
  project: { name: '项目管家', icon: '◈', subline: '结合项目本体和知识库，汇总进度、资源与交付风险。', context: '项目本体 · 交付文档', calls: '待发布', response: '这是一个草稿智能体演示：已读取 8 个项目实体，发现「华东交付项目」延期风险较高，主要受供应商交付节点影响。', result: [['8', '项目实体'], ['1', '高风险项目'], ['4', '关联供应商']] }
};
let selectedAgent = 'insight';
const openAgentDemo = (agent = 'insight') => {
  selectedAgent = agent;
  updateAgentWorkspace(agent);
  agentModal.classList.add('open');
  agentModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeAgentDemo = () => {
  agentModal.classList.remove('open');
  agentModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
};
const updateAgentWorkspace = (agent) => {
  const data = agentData[agent];
  selectedAgent = agent;
  $$('.agent-picker').forEach((item) => item.classList.toggle('active', item.dataset.agentPicker === agent));
  $('#agentLiveIcon').textContent = data.icon;
  $('#agentDialogTitle').textContent = data.name;
  $('#agentDialogSubline').textContent = data.subline;
  $('#agentContext').textContent = data.context;
  $('#agentCalls').textContent = data.calls;
  $('#agentChat').innerHTML = `<div class="agent-message agent-message-ai"><span class="chat-avatar">${data.icon}</span><div><small>${data.name} · 刚刚</small><p>你好，我已经连接到你的企业本体空间。你可以让我分析客户、项目、产品之间的语义关系。</p><div class="suggestion-row"><button class="suggestion" data-prompt="分析本季度客户流失风险">分析本季度客户流失风险</button><button class="suggestion" data-prompt="找出交付响应最慢的项目">找出交付响应最慢的项目</button></div></div></div>`;
  bindSuggestions();
};
const bindSuggestions = () => $$('.suggestion').forEach((button) => button.addEventListener('click', () => {
  agentInput.value = button.dataset.prompt;
  sendAgentMessage();
}));
const sendAgentMessage = () => {
  const prompt = agentInput.value.trim();
  if (!prompt) { toast('请先输入一个问题'); return; }
  const data = agentData[selectedAgent];
  const chat = $('#agentChat');
  const userMessage = document.createElement('div');
  userMessage.className = 'agent-message agent-message-user';
  userMessage.innerHTML = `<div><small>你 · 刚刚</small><p>${prompt.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))}</p></div>`;
  chat.appendChild(userMessage);
  agentInput.value = '';
  chat.scrollTop = chat.scrollHeight;
  window.setTimeout(() => {
    const aiMessage = document.createElement('div');
    aiMessage.className = 'agent-message agent-message-ai';
    aiMessage.innerHTML = `<span class="chat-avatar">${data.icon}</span><div><small>${data.name} · 已完成</small><p>${data.response}</p><div class="agent-result">${data.result.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div></div>`;
    chat.appendChild(aiMessage);
    chat.scrollTop = chat.scrollHeight;
    toast(`${data.name} 已完成语义分析`);
  }, 700);
};
$$('.agent-open').forEach((button) => button.addEventListener('click', () => openAgentDemo(button.dataset.agent)));
$$('.agent-picker').forEach((button) => button.addEventListener('click', () => updateAgentWorkspace(button.dataset.agentPicker)));
$('#closeAgent').addEventListener('click', closeAgentDemo);
agentModal.addEventListener('click', (event) => { if (event.target === agentModal) closeAgentDemo(); });
$('#sendAgent').addEventListener('click', sendAgentMessage);
agentInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendAgentMessage(); }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && agentModal.classList.contains('open')) closeAgentDemo();
});
bindSuggestions();
