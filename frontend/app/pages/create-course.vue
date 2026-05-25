<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi'

definePageMeta({
  middleware: 'auth'
})

const name = ref('')
const description = ref('')
const message = ref('')

const router = useRouter()
const { post } = useApi()

const createCourse = async () => {
  try {
    await post('/courses', {
      name: name.value,
      description: description.value
    })

    router.push('/courses')

  } catch (error) {
    message.value = 'No autorizado o error al crear curso'
  }
}
</script>

<template>
  <div>
    <h1>Crear Curso</h1>

    <input v-model="name" placeholder="Nombre del curso" />
    <br><br>

    <textarea
      v-model="description"
      placeholder="Descripción"
    ></textarea>

    <br><br>

    <button @click="createCourse">
      Crear Curso
    </button>

    <p>{{ message }}</p>
  </div>
</template>