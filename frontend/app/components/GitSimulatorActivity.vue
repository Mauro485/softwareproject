<template>
  <div class="git-simulator-activity w-full max-w-3xl mx-auto">
    <h3 class="text-xl font-bold mb-2 text-white">{{ activity.question }}</h3>
    <p class="text-sm text-[#8b949e] mb-6">Interactúa con la terminal simulada e ingresa el comando correcto para superar este desafío.</p>
    
    <div class="terminal bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl font-mono">
      <!-- Window Controls -->
      <div class="terminal-header flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
        <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
        <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
        <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
        <div class="ml-4 text-xs text-[#8b949e]">bash - git-simulator</div>
      </div>
      
      <!-- Terminal Body -->
      <div class="p-4 min-h-[250px] max-h-[400px] overflow-y-auto text-sm" @click="focusInput">
        <div class="text-[#8b949e] mb-4">
          <p>Bienvenido al Simulador Git interactivo.</p>
          <p>Objetivo: {{ activity.question }}</p>
        </div>

        <div class="terminal-output whitespace-pre-wrap flex flex-col gap-1 mb-2">
          <div v-for="(line, idx) in outputHistory" :key="idx" :class="getLineClass(line.type)">
            {{ line.text }}
          </div>
        </div>
        
        <div class="terminal-input-line flex items-center gap-2 mt-2" v-if="!isComplete">
          <span class="text-[#3fb950] font-bold">estudiante@ova-git:~/proyecto$</span>
          <input 
            ref="cmdInput"
            type="text" 
            v-model="currentCommand" 
            @keydown.enter.prevent="executeCommand"
            class="bg-transparent border-none outline-none text-[#f0f6fc] flex-grow font-mono focus:ring-0 p-0"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>
    </div>
    
    <div v-if="isComplete" class="mt-8 p-4 bg-[#238636]/10 border border-[#238636]/30 text-[#3fb950] rounded-lg text-center font-bold">
      ¡Excelente! Has ejecutado el comando correctamente.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['complete']);

const currentCommand = ref('');
const outputHistory = ref([]);
const cmdInput = ref(null);
const isComplete = ref(false);

const expectedCommand = props.activity.simulatorExpectedCommand?.trim() || '';
const simulatorMode = props.activity.simulatorMode || 'exact_command';

// Mock Git State
const gitState = ref({
  initialized: simulatorMode !== 'create_repo',
  files: simulatorMode === 'create_repo' ? [] : [
    { name: 'index.html', status: 'staged' },
    { name: 'style.css', status: 'modified' }
  ],
  commits: []
});

const getLineClass = (type) => {
  switch (type) {
    case 'cmd': return 'text-[#f0f6fc] font-bold';
    case 'error': return 'text-[#ff7b72]';
    case 'success': return 'text-[#3fb950]';
    case 'warning': return 'text-[#d29922]';
    default: return 'text-[#8b949e]';
  }
};

const executeCommand = () => {
  let cmd = currentCommand.value.trim();
  if (!cmd) return;
  
  // Replace multiple spaces with single space for easier parsing
  cmd = cmd.replace(/\s+/g, ' ');
  
  outputHistory.value.push({ type: 'cmd', text: `estudiante@ova-git:~/proyecto$ ${cmd}` });
  
  const args = cmd.split(' ');
  const baseCmd = args[0];

  // Simulación de comandos comunes
  if (baseCmd === 'clear') {
    outputHistory.value = [];
  } else if (baseCmd === 'ls') {
    const fileNames = gitState.value.files.map(f => f.name).join('  ');
    outputHistory.value.push({ type: 'info', text: fileNames || ' ' });
  } else if (baseCmd === 'touch') {
    if (args.length > 1) {
      const fileName = args[1];
      const exists = gitState.value.files.find(f => f.name === fileName);
      if (!exists) {
        gitState.value.files.push({ name: fileName, status: 'untracked' });
      }
    } else {
      outputHistory.value.push({ type: 'error', text: `touch: missing file operand` });
    }
  } else if (baseCmd === 'git') {
    const subCmd = args[1];
    
    if (subCmd === 'init') {
      if (gitState.value.initialized) {
        outputHistory.value.push({ type: 'info', text: `Reinitialized existing Git repository in /home/estudiante/proyecto/.git/` });
      } else {
        gitState.value.initialized = true;
        outputHistory.value.push({ type: 'info', text: `Initialized empty Git repository in /home/estudiante/proyecto/.git/` });
      }
    } else if (!gitState.value.initialized) {
      outputHistory.value.push({ type: 'error', text: `fatal: not a git repository (or any of the parent directories): .git` });
    } else if (subCmd === 'status') {
      outputHistory.value.push({ type: 'info', text: `On branch main` });
      
      const untracked = gitState.value.files.filter(f => f.status === 'untracked');
      const staged = gitState.value.files.filter(f => f.status === 'staged');
      const modified = gitState.value.files.filter(f => f.status === 'modified');
      
      if (staged.length > 0) {
        outputHistory.value.push({ type: 'info', text: `Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)` });
        staged.forEach(f => outputHistory.value.push({ type: 'success', text: `\tnew file:   ${f.name}` }));
      }
      
      if (modified.length > 0) {
        outputHistory.value.push({ type: 'info', text: `Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)` });
        modified.forEach(f => outputHistory.value.push({ type: 'error', text: `\tmodified:   ${f.name}` }));
      }
      
      if (untracked.length > 0) {
        outputHistory.value.push({ type: 'info', text: `Untracked files:\n  (use "git add <file>..." to include in what will be committed)` });
        untracked.forEach(f => outputHistory.value.push({ type: 'error', text: `\t${f.name}` }));
      }
      
      if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
        outputHistory.value.push({ type: 'info', text: `nothing to commit, working tree clean` });
      }
    } else if (subCmd === 'add') {
      const target = args.slice(2).join(' ');
      if (!target) {
        outputHistory.value.push({ type: 'info', text: `Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?` });
      } else if (target === '.' || target === '-A' || target === '--all') {
        let addedCount = 0;
        gitState.value.files.forEach(f => {
          if (f.status === 'untracked' || f.status === 'modified') {
            f.status = 'staged';
            addedCount++;
          }
        });
        if (addedCount === 0) {
          outputHistory.value.push({ type: 'info', text: `No changes to add.` });
        } else {
          // Feedback educativo visual para comandos silenciosos
          outputHistory.value.push({ type: 'warning', text: `[Simulador: Archivos preparados en el staging area]` });
        }
      } else {
        const file = gitState.value.files.find(f => f.name === target);
        if (file) {
          file.status = 'staged';
          outputHistory.value.push({ type: 'warning', text: `[Simulador: Archivo '${target}' preparado en el staging area]` });
        } else {
          outputHistory.value.push({ type: 'error', text: `fatal: pathspec '${target}' did not match any files` });
        }
      }
    } else if (subCmd === 'commit') {
      const staged = gitState.value.files.filter(f => f.status === 'staged');
      if (staged.length === 0) {
        outputHistory.value.push({ type: 'info', text: `On branch main\nnothing to commit, working tree clean` });
      } else {
        let msg = "Automated commit";
        if (args[2] === '-m') {
          msg = args.slice(3).join(' ').replace(/["']/g, '');
        }
        gitState.value.commits.push(msg);
        
        // Remove staged files from tracking list conceptually or mark them committed
        gitState.value.files = gitState.value.files.filter(f => f.status !== 'staged');
        
        outputHistory.value.push({ type: 'info', text: `[main (root-commit) a1b2c3d] ${msg}\n ${staged.length} files changed` });
      }
    } else if (subCmd === 'log') {
      if (gitState.value.commits.length === 0) {
        outputHistory.value.push({ type: 'error', text: `fatal: your current branch 'main' does not have any commits yet` });
      } else {
        gitState.value.commits.reverse().forEach((msg, i) => {
          outputHistory.value.push({ type: 'warning', text: `commit a1b2c3d4e5f6${i}` });
          outputHistory.value.push({ type: 'info', text: `Author: Estudiante <estudiante@ova.com>\nDate:   Today\n\n    ${msg}\n` });
        });
        gitState.value.commits.reverse(); // put back
      }
    } else {
      outputHistory.value.push({ type: 'error', text: `git: '${subCmd}' is not a git command. See 'git --help'.` });
    }
  } else {
    outputHistory.value.push({ type: 'error', text: `bash: ${baseCmd}: command not found` });
  }

  // Verificar si alcanzó la meta según el modo
  let reachedGoal = false;
  
  if (simulatorMode === 'exact_command') {
    // Normalizar comillas para evitar fallos tontos (ej: git commit -m "hola" vs git commit -m 'hola')
    const normalizedCmd = cmd.replace(/["']/g, '');
    const normalizedExpected = expectedCommand.replace(/["']/g, '');
    if (normalizedCmd.startsWith(normalizedExpected)) {
      reachedGoal = true;
    }
  } else if (simulatorMode === 'create_repo') {
    if (gitState.value.initialized) reachedGoal = true;
  } else if (simulatorMode === 'make_commit') {
    if (gitState.value.commits.length > 0) reachedGoal = true;
  }

  if (reachedGoal && !isComplete.value) {
    // Buscar si la última línea fue un error falso, lo removemos
    if (outputHistory.value.length > 0 && outputHistory.value[outputHistory.value.length - 1].type === 'error') {
       outputHistory.value.pop();
    }
    
    outputHistory.value.push({ type: 'success', text: `\n[¡Meta Alcanzada!] Lo has logrado correctamente.` });
    isComplete.value = true;
    currentCommand.value = '';
    emit('complete', true);
  }
  
  currentCommand.value = '';
  
  nextTick(() => {
    if (cmdInput.value && !isComplete.value) {
      cmdInput.value.scrollIntoView();
      cmdInput.value.focus();
    }
  });
};

const focusInput = () => {
  if (cmdInput.value && !isComplete.value) {
    cmdInput.value.focus();
  }
};

onMounted(() => {
  focusInput();
});
</script>
