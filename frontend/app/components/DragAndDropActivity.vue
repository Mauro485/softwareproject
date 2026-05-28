<template>
  <div class="drag-drop-activity w-full max-w-3xl mx-auto">
    <h3 class="text-xl font-bold mb-6 text-white">{{ activity.question }}</h3>
    
    <div class="flex flex-col gap-8">
      <!-- Draggables (Opciones) -->
      <div class="w-full">
        <h4 class="font-bold mb-4 text-[#8b949e] uppercase text-sm">Opciones Disponibles (Arrastra)</h4>
        <div class="flex flex-wrap gap-3">
          <div 
            v-for="item in draggables" 
            :key="item.id"
            :draggable="!item.matched"
            @dragstart="onDragStart($event, item)"
            :class="['draggable-item', item.matched ? 'matched' : 'available']"
          >
            {{ item.text }}
          </div>
        </div>
      </div>
      
      <!-- Targets (Destinos con espacios en blanco) -->
      <div class="w-full">
        <h4 class="font-bold mb-4 text-[#8b949e] uppercase text-sm">Afirmaciones (Suelta la opción correcta en el espacio)</h4>
        <div class="flex flex-col gap-4">
          <div 
            v-for="target in targets" 
            :key="target.id"
            class="target-row"
          >
            <!-- Drop Zone (Espacio en blanco) -->
            <div 
              @dragover.prevent="onDragOver($event, target)"
              @dragleave.prevent="onDragLeave($event, target)"
              @drop="onDrop($event, target)"
              :class="['drop-zone', 
                target.matchedItem ? 'matched' : 
                (target.isHovered ? 'hovered' : 'empty')]"
            >
              <span v-if="target.matchedItem" class="text-center px-2 line-clamp-1" :title="target.matchedItem.text">{{ target.matchedItem.text }}</span>
              <span v-else>Arrastra aquí</span>
            </div>
            
            <!-- Target Definition Text -->
            <div class="text-sm text-white font-medium flex-1 leading-relaxed">
              {{ target.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isComplete" class="mt-8 p-4 bg-[#238636]/10 border border-[#238636]/30 text-[#3fb950] rounded-lg text-center font-bold">
      ¡Excelente! Has emparejado todos los elementos correctamente.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['complete']);

const draggables = ref([]);
const targets = ref([]);

onMounted(() => {
  const shuffle = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const pairs = props.activity.dragDropPairs || [];
  
  draggables.value = shuffle(pairs.map((p, i) => ({ id: `drag-${i}`, pairId: i, text: p.draggable, matched: false })));
  targets.value = shuffle(pairs.map((p, i) => ({ id: `target-${i}`, pairId: i, text: p.target, matchedItem: null, isHovered: false })));
});

const onDragStart = (event, item) => {
  if (item.matched) {
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData('itemId', item.id);
  event.dataTransfer.effectAllowed = 'move';
};

const onDragOver = (event, target) => {
  if (!target.matchedItem) {
    target.isHovered = true;
  }
};

const onDragLeave = (event, target) => {
  target.isHovered = false;
};

const onDrop = (event, target) => {
  target.isHovered = false;
  if (target.matchedItem) return; 
  
  const itemId = event.dataTransfer.getData('itemId');
  const draggedItem = draggables.value.find(d => d.id === itemId);
  
  if (draggedItem && draggedItem.pairId === target.pairId) {
    draggedItem.matched = true;
    target.matchedItem = draggedItem;
    checkCompletion();
  }
};

const isComplete = computed(() => {
  return targets.value.length > 0 && targets.value.every(t => t.matchedItem !== null);
});

const checkCompletion = () => {
  if (isComplete.value) {
    emit('complete', true);
  }
};
</script>

<style scoped>
.draggable-item {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  font-weight: bold;
  transition: all 0.2s;
  user-select: none;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
}

.draggable-item.available {
  background-color: #1f2428;
  border-color: #ff6600;
  color: #ff6600;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.draggable-item.available:hover {
  background-color: #ff6600;
  color: white;
}

.draggable-item.available:active {
  cursor: grabbing;
}

.draggable-item.matched {
  background-color: rgba(22, 27, 34, 0.5);
  border-color: rgba(35, 134, 54, 0.3);
  color: #8b949e;
  opacity: 0.4;
  cursor: default;
}

.target-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.drop-zone {
  width: 12rem;
  height: 3rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  border-width: 2px;
  transition: all 0.2s;
}

.drop-zone.matched {
  background-color: rgba(35, 134, 54, 0.2);
  border-color: #238636;
  border-style: solid;
  color: white;
  font-weight: bold;
}

.drop-zone.hovered {
  background-color: rgba(255, 102, 0, 0.2);
  border-color: #ff6600;
  border-style: dashed;
}

.drop-zone.empty {
  background-color: #0d1117;
  border-color: #484f58;
  border-style: dashed;
  color: #8b949e;
  font-size: 0.875rem;
}
</style>
