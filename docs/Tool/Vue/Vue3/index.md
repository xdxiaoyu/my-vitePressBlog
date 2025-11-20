# Vue3 核心特性与实战

Vue 3 是 Vue.js 的最新主版本，相比 Vue 2 带来了更好的性能、更小的打包体积、更强的 TypeScript 支持，以及全新的 Composition API。

## 一、Vue3 的核心变化

### 1. 性能提升

Vue 3 在多个方面进行了性能优化：

- **更快的虚拟 DOM**：重写了虚拟 DOM 实现，性能提升 1.3~2 倍
- **更高效的组件初始化**：组件实例初始化速度提升约 1.5 倍
- **编译器优化**：通过静态标记（PatchFlag）减少运行时开销
- **Tree-shaking 支持**：未使用的功能不会打包到最终代码中

### 2. Composition API

Composition API 是 Vue 3 最重要的新特性，解决了 Options API 在大型项目中的局限性。

#### 基本使用

```js
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    // 响应式状态
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    
    // 方法
    const increment = () => {
      count.value++
    }
    
    // 生命周期钩子
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    // 返回给模板使用
    return {
      count,
      doubleCount,
      increment
    }
  }
}
```

#### setup 语法糖（推荐）

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>
```

### 3. 响应式系统

Vue 3 使用 ES6 的 Proxy 替代了 Vue 2 的 Object.defineProperty，带来了更强大的响应式能力。

#### ref 和 reactive

```js
import { ref, reactive } from 'vue'

// ref - 用于基本类型
const count = ref(0)
console.log(count.value) // 需要 .value 访问

// reactive - 用于对象类型
const state = reactive({
  count: 0,
  name: '张三'
})
console.log(state.count) // 直接访问

// ref 也可以用于对象
const user = ref({
  name: '李四',
  age: 25
})
console.log(user.value.name) // 需要 .value
```

#### toRef 和 toRefs

```js
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({
  foo: 1,
  bar: 2
})

// toRef - 将响应式对象的单个属性转换为 ref
const fooRef = toRef(state, 'foo')

// toRefs - 将响应式对象的所有属性都转换为 ref
const stateRefs = toRefs(state)

// 解构时保持响应式
const { foo, bar } = toRefs(state)
```

#### computed 计算属性

```js
import { ref, computed } from 'vue'

const count = ref(1)

// 只读计算属性
const doubleCount = computed(() => count.value * 2)

// 可写计算属性
const fullName = computed({
  get() {
    return firstName.value + ' ' + lastName.value
  },
  set(newValue) {
    [firstName.value, lastName.value] = newValue.split(' ')
  }
})
```

#### watch 和 watchEffect

```js
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const name = ref('张三')

// watch - 侦听特定的数据源
watch(count, (newValue, oldValue) => {
  console.log(`count 从 ${oldValue} 变为 ${newValue}`)
})

// 侦听多个数据源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('多个值发生了变化')
})

// 立即执行
watch(count, (newValue) => {
  console.log(newValue)
}, { immediate: true })

// 深度侦听
const state = ref({ count: 0 })
watch(state, (newValue) => {
  console.log('深度侦听')
}, { deep: true })

// watchEffect - 自动收集依赖
watchEffect(() => {
  console.log(`count 是: ${count.value}`)
  console.log(`name 是: ${name.value}`)
  // 自动追踪 count 和 name 的变化
})
```

## 二、生命周期

Vue 3 的生命周期钩子在 Composition API 中有所调整：

```js
import { 
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

export default {
  setup() {
    // beforeCreate 和 created 被 setup 替代
    
    onBeforeMount(() => {
      console.log('组件挂载前')
    })
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onBeforeUpdate(() => {
      console.log('组件更新前')
    })
    
    onUpdated(() => {
      console.log('组件已更新')
    })
    
    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })
    
    onUnmounted(() => {
      console.log('组件已卸载')
    })
    
    // keep-alive 相关
    onActivated(() => {
      console.log('被激活')
    })
    
    onDeactivated(() => {
      console.log('被停用')
    })
    
    onErrorCaptured((err, instance, info) => {
      console.log('捕获错误', err)
    })
  }
}
```

**生命周期对比：**

| Options API | Composition API |
|------------|-----------------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeUnmount | onBeforeUnmount |
| unmounted | onUnmounted |

## 三、组件通信

### 1. Props

```vue
<script setup>
// 基础用法
const props = defineProps({
  title: String,
  count: {
    type: Number,
    default: 0,
    required: true
  }
})

// TypeScript 类型定义
const props = defineProps<{
  title: string
  count?: number
}>()

// 带默认值的 TypeScript 定义
const props = withDefaults(defineProps<{
  title?: string
  count?: number
}>(), {
  title: '默认标题',
  count: 0
})
</script>
```

### 2. Emits

```vue
<script setup>
// 声明事件
const emit = defineEmits(['update', 'delete'])

// 触发事件
const handleClick = () => {
  emit('update', { id: 1 })
}

// TypeScript 类型定义
const emit = defineEmits<{
  update: [value: { id: number }]
  delete: [id: number]
}>()
</script>
```

### 3. v-model

Vue 3 支持多个 v-model：

```vue
<!-- 父组件 -->
<UserName
  v-model:first-name="firstName"
  v-model:last-name="lastName"
/>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  firstName: String,
  lastName: String
})

const emit = defineEmits(['update:firstName', 'update:lastName'])

const updateFirstName = (value) => {
  emit('update:firstName', value)
}
</script>
```

### 4. provide / inject

用于祖先组件向后代组件传递数据：

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
const updateTheme = (value) => {
  theme.value = value
}

provide('theme', {
  theme,
  updateTheme
})
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const { theme, updateTheme } = inject('theme')
</script>
```

### 5. expose / ref

父组件访问子组件实例：

```vue
<!-- 子组件 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 明确暴露给父组件
defineExpose({
  count,
  increment
})
</script>

<!-- 父组件 -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

const callChildMethod = () => {
  childRef.value.increment()
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>
```

## 四、组合式函数（Composables）

组合式函数是利用 Composition API 来封装可复用的状态逻辑。

### 示例：useMouse

```js
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}
```

**使用：**

```vue
<script setup>
import { useMouse } from './composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>鼠标位置: {{ x }}, {{ y }}</p>
</template>
```

### 示例：useFetch

```js
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  watchEffect(async () => {
    loading.value = true
    data.value = null
    error.value = null

    try {
      const res = await fetch(toValue(url))
      data.value = await res.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  })

  return { data, error, loading }
}
```

**使用：**

```vue
<script setup>
import { ref } from 'vue'
import { useFetch } from './composables/useFetch'

const url = ref('https://api.example.com/data')
const { data, error, loading } = useFetch(url)
</script>

<template>
  <div v-if="loading">加载中...</div>
  <div v-else-if="error">错误: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

## 五、Teleport

Teleport 可以将组件的 HTML 渲染到 DOM 的其他位置。

```vue
<template>
  <button @click="open = true">打开模态框</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <div class="modal-content">
        <p>这是一个模态框</p>
        <button @click="open = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>
```

## 六、Suspense（实验性）

Suspense 用于协调对组件树中嵌套的异步依赖的处理。

```vue
<template>
  <Suspense>
    <!-- 具有异步 setup() 的组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中状态 -->
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>

<script setup>
import AsyncComponent from './AsyncComponent.vue'
</script>
```

异步组件：

```vue
<script setup>
// AsyncComponent.vue
const data = await fetch('https://api.example.com/data').then(r => r.json())
</script>

<template>
  <div>{{ data }}</div>
</template>
```

## 七、响应式工具

### shallowRef 和 shallowReactive

只对顶层属性进行响应式处理，性能更好：

```js
import { shallowRef, shallowReactive } from 'vue'

// shallowRef
const state = shallowRef({ count: 0 })
// 这不会触发更新
state.value.count = 1
// 这会触发更新
state.value = { count: 1 }

// shallowReactive
const state = shallowReactive({
  foo: 1,
  nested: {
    bar: 2
  }
})
// 这会触发更新
state.foo = 2
// 这不会触发更新
state.nested.bar = 3
```

### readonly 和 shallowReadonly

创建只读的响应式对象：

```js
import { reactive, readonly } from 'vue'

const original = reactive({ count: 0 })
const copy = readonly(original)

// 修改 original 会触发 copy 的更新
original.count++

// 修改 copy 会警告并失败
copy.count++ // 警告
```

### toRaw 和 markRaw

```js
import { reactive, toRaw, markRaw } from 'vue'

const foo = { count: 0 }
const reactiveFoo = reactive(foo)

// 获取原始对象
console.log(toRaw(reactiveFoo) === foo) // true

// 标记为非响应式
const immutable = markRaw({ count: 0 })
const reactiveImmutable = reactive(immutable)
console.log(reactiveImmutable === immutable) // true
```

## 八、TypeScript 支持

Vue 3 从底层重写，提供了完整的 TypeScript 支持。

### 组件类型定义

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型推断
const count = ref(0) // Ref<number>

// 显式类型
const name = ref<string>('张三')
const user = ref<{ name: string; age: number }>({ name: '李四', age: 25 })

// 计算属性类型推断
const doubleCount = computed(() => count.value * 2) // ComputedRef<number>

// 事件处理器
const handleClick = (event: MouseEvent) => {
  console.log(event.target)
}
</script>
```

### Props 类型定义

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
</script>
```

### Emits 类型定义

```vue
<script setup lang="ts">
interface Emits {
  (e: 'update', value: number): void
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()
</script>
```

## 九、性能优化

### 1. v-memo

缓存模板的一部分，只在依赖变化时更新：

```vue
<template>
  <div v-memo="[value1, value2]">
    <!-- 只有 value1 或 value2 变化时才会更新 -->
  </div>
</template>
```

### 2. v-once

只渲染一次，后续不再更新：

```vue
<template>
  <div v-once>
    {{ staticContent }}
  </div>
</template>
```

### 3. 异步组件

```js
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
)

// 带选项
const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 4. KeepAlive

缓存不活跃的组件实例：

```vue
<template>
  <KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
    <component :is="currentComponent" />
  </KeepAlive>
</template>
```

## 十、迁移指南

### 从 Vue 2 迁移到 Vue 3

主要变化：

1. **全局 API**：
```js
// Vue 2
import Vue from 'vue'
Vue.use(VueRouter)

// Vue 3
import { createApp } from 'vue'
const app = createApp(App)
app.use(VueRouter)
```

2. **v-model 变化**：
```vue
<!-- Vue 2 -->
<MyComponent v-model="value" />
<!-- 等同于 -->
<MyComponent :value="value" @input="value = $event" />

<!-- Vue 3 -->
<MyComponent v-model="value" />
<!-- 等同于 -->
<MyComponent :modelValue="value" @update:modelValue="value = $event" />
```

3. **移除的特性**：
   - 移除了 `$on`、`$off`、`$once` 实例方法
   - 移除了过滤器（filters）
   - 移除了 `$children`
   - 移除了 `$destroy`

4. **Fragments**：组件可以有多个根节点
```vue
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

## 十一、最佳实践

### 1. 组合式函数命名

以 `use` 开头，如 `useMouse`、`useFetch`

### 2. ref vs reactive

- **ref**：适用于基本类型和需要重新赋值的对象
- **reactive**：适用于对象和数组，不需要 `.value`

### 3. 响应式解构

```js
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: '张三'
})

// 错误：会失去响应式
const { count } = state

// 正确：使用 toRefs
const { count } = toRefs(state)
```

### 4. 避免在 watchEffect 中修改状态

```js
// ❌ 可能导致无限循环
watchEffect(() => {
  count.value = count.value + 1
})

// ✅ 使用 watch
watch(source, () => {
  count.value = count.value + 1
})
```

### 5. 合理使用 computed

```js
// ✅ 好的做法
const filteredList = computed(() => {
  return list.value.filter(item => item.active)
})

// ❌ 不要在 computed 中修改状态
const badComputed = computed(() => {
  count.value++ // 不要这样做！
  return count.value
})
```

## 十二、常用生态

### 1. Vue Router 4

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue')
    }
  ]
})

// 在组合式 API 中使用
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
```

### 2. Pinia（状态管理）

Pinia 是 Vue 3 官方推荐的状态管理库：

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})

// 使用
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
counter.increment()
```

### 3. VueUse

强大的组合式函数集合：

```js
import { useMouse, useLocalStorage, useFetch } from '@vueuse/core'

const { x, y } = useMouse()
const state = useLocalStorage('my-key', { count: 0 })
const { data, error } = useFetch('https://api.example.com')
```

## 总结

Vue 3 带来了全新的开发体验，主要优势：

✅ **更好的性能**：更快的渲染速度和更小的打包体积  
✅ **Composition API**：更好的代码组织和复用  
✅ **完整的 TypeScript 支持**：类型安全和更好的 IDE 支持  
✅ **新特性**：Teleport、Suspense、Fragments 等  
✅ **更好的生态**：Vue Router 4、Pinia、VueUse 等

对于新项目，强烈建议直接使用 Vue 3 + TypeScript + Vite 的技术栈。

## 参考资源

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [VueUse](https://vueuse.org/)
- [Pinia](https://pinia.vuejs.org/)

