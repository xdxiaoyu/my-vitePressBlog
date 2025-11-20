# Vue3 核心原理深度解析

深入剖析 Vue3 的底层实现原理，从源码角度理解 Vue3 的设计思想和性能优化策略。

## 一、响应式系统原理

### 1.1 Proxy vs Object.defineProperty

Vue3 使用 Proxy 替代了 Vue2 的 Object.defineProperty，这是一个根本性的改变。

#### Vue2 的局限性

```js
// Vue2 使用 Object.defineProperty
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      track(obj, key)
      return val
    },
    set(newVal) {
      if (newVal !== val) {
        val = newVal
        // 触发更新
        trigger(obj, key)
      }
    }
  })
}

// 问题1：无法检测属性的新增和删除
const obj = { a: 1 }
defineReactive(obj, 'a', 1)
obj.b = 2 // 无法检测到
delete obj.a // 无法检测到

// 问题2：无法检测数组索引和length的变化
const arr = [1, 2, 3]
arr[0] = 4 // 无法检测到
arr.length = 0 // 无法检测到

// 问题3：需要递归遍历所有属性
const deepObj = {
  a: { b: { c: 1 } }
}
// 需要递归处理 a、b、c 所有层级
```

#### Vue3 的 Proxy 方案

```js
// Vue3 使用 Proxy
function reactive(target) {
  return new Proxy(target, {
    // 拦截属性读取
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      
      // 依赖收集
      track(target, key)
      
      // 如果是对象，递归代理（懒代理）
      if (isObject(res)) {
        return reactive(res)
      }
      
      return res
    },
    
    // 拦截属性设置
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      
      // 触发更新
      if (oldValue !== value) {
        trigger(target, key)
      }
      
      return result
    },
    
    // 拦截属性删除
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key)
      const result = Reflect.deleteProperty(target, key)
      
      if (hadKey && result) {
        trigger(target, key)
      }
      
      return result
    },
    
    // 拦截 in 操作符
    has(target, key) {
      const result = Reflect.has(target, key)
      track(target, key)
      return result
    },
    
    // 拦截 Object.keys、for...in 等
    ownKeys(target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
    }
  })
}
```

**Proxy 的优势：**

1. ✅ 可以检测属性的新增和删除
2. ✅ 可以检测数组索引和 length 的变化
3. ✅ 懒代理：只在访问时才递归代理子对象
4. ✅ 支持 Map、Set、WeakMap、WeakSet 等数据结构
5. ✅ 更好的性能：不需要预先递归遍历所有属性

### 1.2 依赖收集与触发更新

Vue3 的响应式系统核心是**依赖收集**和**触发更新**。

#### 核心数据结构

```js
// 全局依赖图
// WeakMap { target -> Map { key -> Set [effect1, effect2, ...] } }
const targetMap = new WeakMap()

// 当前活动的 effect
let activeEffect = undefined

// 副作用函数栈
const effectStack = []
```

#### 依赖收集 track

```js
/**
 * 收集依赖
 * @param {Object} target - 响应式对象
 * @param {String} key - 访问的属性
 */
function track(target, key) {
  // 如果没有活动的 effect，不需要收集
  if (!activeEffect) return
  
  // 获取 target 对应的依赖 Map
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  // 获取 key 对应的依赖 Set
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  // 将当前 effect 添加到依赖集合中
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    // 双向记录：effect 也记录它依赖了哪些属性
    activeEffect.deps.push(dep)
  }
}
```

#### 触发更新 trigger

```js
/**
 * 触发更新
 * @param {Object} target - 响应式对象
 * @param {String} key - 修改的属性
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  // 收集需要执行的 effects
  const effects = new Set()
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        // 避免在 effect 执行时触发自己（避免无限循环）
        if (effect !== activeEffect) {
          effects.add(effect)
        }
      })
    }
  }
  
  // 获取 key 对应的所有 effects
  add(depsMap.get(key))
  
  // 如果是数组的 length 属性，需要触发索引相关的 effects
  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= target.length) {
        add(dep)
      }
    })
  }
  
  // 执行所有 effects
  effects.forEach(effect => {
    if (effect.options.scheduler) {
      // 如果有调度器，使用调度器执行
      effect.options.scheduler(effect)
    } else {
      // 否则直接执行
      effect()
    }
  })
}
```

#### effect 函数

```js
/**
 * 创建响应式副作用函数
 * @param {Function} fn - 副作用函数
 * @param {Object} options - 配置选项
 */
function effect(fn, options = {}) {
  const effect = function reactiveEffect() {
    // 如果已经在 effectStack 中，说明是递归调用，直接返回
    if (!effectStack.includes(effect)) {
      // 清除之前收集的依赖
      cleanup(effect)
      
      try {
        // 入栈
        effectStack.push(effect)
        activeEffect = effect
        
        // 执行副作用函数，期间会进行依赖收集
        return fn()
      } finally {
        // 出栈
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  
  effect.id = uid++ // 唯一标识
  effect.deps = [] // 存储依赖的集合
  effect.options = options
  
  // 如果不是 lazy，立即执行
  if (!options.lazy) {
    effect()
  }
  
  return effect
}

/**
 * 清除副作用的所有依赖
 */
function cleanup(effect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```

#### 完整示例

```js
// 创建响应式对象
const state = reactive({ count: 0, name: '张三' })

// 创建副作用函数
effect(() => {
  // 访问 state.count，触发 track，收集依赖
  console.log('count:', state.count)
})
// 输出: count: 0

// 修改 state.count，触发 trigger，执行副作用函数
state.count++
// 输出: count: 1

// 修改 state.name，不会触发上面的副作用（因为没有访问 name）
state.name = '李四'
// 无输出
```

### 1.3 ref 的实现原理

ref 用于将基本类型值包装成响应式对象。

```js
class RefImpl {
  constructor(value) {
    this._value = convert(value)
    this._rawValue = value
    this.dep = new Set() // 依赖集合
  }
  
  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }
  
  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = convert(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}

function ref(value) {
  return new RefImpl(value)
}

// 如果是对象，转换为 reactive
function convert(value) {
  return isObject(value) ? reactive(value) : value
}

// 收集 ref 的依赖
function trackRefValue(ref) {
  if (activeEffect) {
    ref.dep.add(activeEffect)
    activeEffect.deps.push(ref.dep)
  }
}

// 触发 ref 的更新
function triggerRefValue(ref) {
  const effects = [...ref.dep]
  effects.forEach(effect => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}
```

### 1.4 computed 的实现原理

computed 是一个特殊的 effect，具有缓存和懒执行的特性。

```js
class ComputedRefImpl {
  constructor(getter, setter) {
    this._getter = getter
    this._setter = setter
    this._value = undefined
    this._dirty = true // 脏检查标记
    
    // 创建 effect，使用 scheduler 实现懒执行
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        // 当依赖变化时，不立即计算，只标记为 dirty
        if (!this._dirty) {
          this._dirty = true
          // 触发依赖 computed 的副作用
          triggerRefValue(this)
        }
      }
    })
  }
  
  get value() {
    // 收集依赖 computed 的副作用
    trackRefValue(this)
    
    // 只有 dirty 时才重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect()
    }
    
    return this._value
  }
  
  set value(newValue) {
    this._setter(newValue)
  }
}

function computed(getterOrOptions) {
  let getter, setter
  
  if (typeof getterOrOptions === 'function') {
    getter = getterOrOptions
    setter = () => {
      console.warn('Computed is readonly')
    }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  
  return new ComputedRefImpl(getter, setter)
}
```

**computed 的特性：**

1. **缓存**：只有依赖变化时才重新计算
2. **懒执行**：只有被访问时才计算
3. **链式依赖**：computed 可以依赖其他 computed

```js
const state = reactive({ count: 0 })

const double = computed(() => {
  console.log('计算 double')
  return state.count * 2
})

const quadruple = computed(() => {
  console.log('计算 quadruple')
  return double.value * 2
})

console.log(quadruple.value)
// 输出：
// 计算 double
// 计算 quadruple
// 0

console.log(quadruple.value) // 不会重新计算，使用缓存
// 无输出，直接返回 0

state.count = 1
console.log(quadruple.value)
// 输出：
// 计算 double
// 计算 quadruple
// 4
```

## 二、编译器原理

### 2.1 编译流程

Vue3 的模板编译分为三个阶段：

```
模板字符串 -> parse -> AST -> transform -> JavaScript AST -> generate -> 渲染函数
```

#### 完整示例

```js
// 模板
const template = `
<div id="app">
  <p>{{ message }}</p>
  <button @click="handleClick">点击</button>
</div>
`

// 1. parse：解析成 AST
const ast = parse(template)

// 2. transform：转换和优化 AST
transform(ast, {
  nodeTransforms: [
    transformElement,
    transformText,
    transformExpression
  ]
})

// 3. generate：生成渲染函数代码
const code = generate(ast)

console.log(code)
// 输出类似：
// function render(_ctx) {
//   return _createVNode("div", { id: "app" }, [
//     _createVNode("p", null, _toDisplayString(_ctx.message)),
//     _createVNode("button", { onClick: _ctx.handleClick }, "点击")
//   ])
// }
```

### 2.2 静态提升（Static Hoisting）

Vue3 编译器会识别静态节点，将其提升到渲染函数外部，避免每次重新创建。

```js
// 模板
const template = `
<div>
  <p>静态文本</p>
  <p>{{ message }}</p>
</div>
`

// 编译后（简化版）
const _hoisted_1 = _createVNode("p", null, "静态文本")

function render(_ctx) {
  return _createVNode("div", null, [
    _hoisted_1, // 复用静态节点
    _createVNode("p", null, _toDisplayString(_ctx.message))
  ])
}
```

### 2.3 补丁标记（Patch Flag）

Vue3 使用 Patch Flag 标记动态内容，在 diff 时只比较动态部分。

```js
// 模板
const template = `<div :class="cls">{{ message }}</div>`

// 编译后（简化）
function render(_ctx) {
  return _createVNode("div", {
    class: _ctx.cls
  }, _ctx.message, 
  3 /* TEXT | CLASS */  // Patch Flag
  )
}

// Patch Flags 定义
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态属性（除 class 和 style）
  FULL_PROPS: 16,    // 有 key 的动态属性
  HYDRATE_EVENTS: 32, // 有事件监听器
  STABLE_FRAGMENT: 64, // 稳定的 fragment
  KEYED_FRAGMENT: 128, // 有 key 的 fragment
  UNKEYED_FRAGMENT: 256, // 无 key 的 fragment
  NEED_PATCH: 512,   // 需要 patch
  DYNAMIC_SLOTS: 1024, // 动态插槽
  HOISTED: -1,       // 静态节点
  BAIL: -2           // diff 算法应该退出优化模式
}
```

**优势：**

在 diff 时，可以直接跳过静态属性，只处理有 Patch Flag 的部分：

```js
// Vue3 的 diff 优化
function patchElement(n1, n2) {
  const patchFlag = n2.patchFlag
  
  // 如果有 Patch Flag，只处理对应的部分
  if (patchFlag > 0) {
    if (patchFlag & PatchFlags.TEXT) {
      // 只更新文本
      patchText(n1, n2)
    }
    if (patchFlag & PatchFlags.CLASS) {
      // 只更新 class
      patchClass(n1, n2)
    }
    // ...
  } else {
    // 全量 diff
    patchProps(n1, n2)
    patchChildren(n1, n2)
  }
}
```

### 2.4 事件缓存

Vue3 会缓存事件处理函数，避免每次渲染都创建新函数。

```vue
<!-- 模板 -->
<button @click="handleClick">点击</button>

<!-- 编译后（Vue2） -->
<script>
function render(_ctx) {
  return _createVNode("button", {
    onClick: () => _ctx.handleClick() // 每次都创建新函数
  }, "点击")
}
</script>

<!-- 编译后（Vue3） -->
<script>
function render(_ctx, _cache) {
  return _createVNode("button", {
    onClick: _cache[0] || (_cache[0] = (...args) => _ctx.handleClick(...args))
  }, "点击")
}
// 使用 _cache 缓存函数
</script>
```

## 三、虚拟 DOM 与 Diff 算法

### 3.1 虚拟 DOM 结构

```js
// VNode 的基本结构
const vnode = {
  type: 'div',        // 元素类型
  props: {            // 属性
    id: 'app',
    class: 'container'
  },
  children: [         // 子节点
    {
      type: 'p',
      props: null,
      children: 'Hello'
    }
  ],
  key: null,          // key
  el: null,           // 对应的真实 DOM
  patchFlag: 0,       // 补丁标记
  dynamicProps: null, // 动态属性
  shapeFlag: 1        // 节点类型标记
}

// ShapeFlags 用于快速判断 VNode 类型
const ShapeFlags = {
  ELEMENT: 1,               // 普通元素
  FUNCTIONAL_COMPONENT: 2,  // 函数式组件
  STATEFUL_COMPONENT: 4,    // 有状态组件
  TEXT_CHILDREN: 8,         // 子节点是文本
  ARRAY_CHILDREN: 16,       // 子节点是数组
  SLOTS_CHILDREN: 32,       // 子节点是插槽
  TELEPORT: 64,             // teleport
  SUSPENSE: 128,            // suspense
  COMPONENT: 6              // 组件（2 | 4）
}
```

### 3.2 快速 Diff 算法

Vue3 采用了最长递增子序列算法优化 Diff 性能。

#### 核心思路

1. **前置对比**：从前往后比较，找到不同的位置
2. **后置对比**：从后往前比较，找到不同的位置
3. **处理新增**：只有新节点
4. **处理删除**：只有旧节点
5. **处理移动**：使用最长递增子序列找到不需要移动的节点

```js
function patchKeyedChildren(oldChildren, newChildren, container) {
  let i = 0
  const oldLength = oldChildren.length
  let oldEnd = oldLength - 1
  const newLength = newChildren.length
  let newEnd = newLength - 1
  
  // 1. 前置对比
  // (a b) c
  // (a b) d e
  while (i <= oldEnd && i <= newEnd) {
    const oldVNode = oldChildren[i]
    const newVNode = newChildren[i]
    
    if (isSameVNodeType(oldVNode, newVNode)) {
      patch(oldVNode, newVNode, container)
      i++
    } else {
      break
    }
  }
  
  // 2. 后置对比
  // a (b c)
  // d e (b c)
  while (i <= oldEnd && i <= newEnd) {
    const oldVNode = oldChildren[oldEnd]
    const newVNode = newChildren[newEnd]
    
    if (isSameVNodeType(oldVNode, newVNode)) {
      patch(oldVNode, newVNode, container)
      oldEnd--
      newEnd--
    } else {
      break
    }
  }
  
  // 3. 只有新增节点
  // (a b)
  // (a b) c d
  // i = 2, oldEnd = 1, newEnd = 3
  if (i > oldEnd) {
    if (i <= newEnd) {
      while (i <= newEnd) {
        patch(null, newChildren[i], container)
        i++
      }
    }
  }
  // 4. 只有删除节点
  // (a b) c d
  // (a b)
  // i = 2, oldEnd = 3, newEnd = 1
  else if (i > newEnd) {
    while (i <= oldEnd) {
      unmount(oldChildren[i])
      i++
    }
  }
  // 5. 处理乱序情况
  else {
    const oldStart = i
    const newStart = i
    
    // 构建新节点的 key -> index 映射
    const keyToNewIndexMap = new Map()
    for (i = newStart; i <= newEnd; i++) {
      const newVNode = newChildren[i]
      if (newVNode.key != null) {
        keyToNewIndexMap.set(newVNode.key, i)
      }
    }
    
    // 记录新节点在旧节点中的位置
    const newIndexToOldIndexMap = new Array(newEnd - newStart + 1).fill(0)
    
    let patched = 0
    const toBePatched = newEnd - newStart + 1
    let moved = false
    let maxNewIndexSoFar = 0
    
    // 遍历旧节点
    for (i = oldStart; i <= oldEnd; i++) {
      const oldVNode = oldChildren[i]
      
      if (patched >= toBePatched) {
        // 新节点已经全部处理完，剩余的旧节点都删除
        unmount(oldVNode)
        continue
      }
      
      let newIndex
      if (oldVNode.key != null) {
        // 通过 key 找到新节点的位置
        newIndex = keyToNewIndexMap.get(oldVNode.key)
      } else {
        // 没有 key，线性查找
        for (let j = newStart; j <= newEnd; j++) {
          if (isSameVNodeType(oldVNode, newChildren[j])) {
            newIndex = j
            break
          }
        }
      }
      
      if (newIndex === undefined) {
        // 旧节点在新节点中不存在，删除
        unmount(oldVNode)
      } else {
        // 记录位置映射
        newIndexToOldIndexMap[newIndex - newStart] = i + 1
        
        // 判断是否需要移动
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }
        
        // 更新节点
        patch(oldVNode, newChildren[newIndex], container)
        patched++
      }
    }
    
    // 移动和挂载新节点
    if (moved) {
      // 计算最长递增子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = increasingNewIndexSequence.length - 1
      
      // 从后往前遍历，保证稳定性
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = newStart + i
        const newVNode = newChildren[nextIndex]
        const anchor = nextIndex + 1 < newLength 
          ? newChildren[nextIndex + 1].el 
          : null
        
        if (newIndexToOldIndexMap[i] === 0) {
          // 新增节点
          patch(null, newVNode, container, anchor)
        } else if (moved) {
          // 需要移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(newVNode, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }
}
```

#### 最长递增子序列算法

```js
/**
 * 获取最长递增子序列的索引
 * @param {Array<number>} arr 
 * @returns {Array<number>}
 */
function getSequence(arr) {
  const len = arr.length
  const result = [0] // 存储递增子序列的索引
  const p = arr.slice() // 存储前驱索引
  
  let i, j, u, v, c
  
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    
    if (arrI !== 0) {
      j = result[result.length - 1]
      
      // 如果当前值大于结果数组的最后一个值，直接追加
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      
      // 二分查找，找到第一个大于 arrI 的位置
      u = 0
      v = result.length - 1
      
      while (u < v) {
        c = Math.floor((u + v) / 2)
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  
  // 回溯构建完整的递增子序列
  u = result.length
  v = result[u - 1]
  
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  
  return result
}

// 示例
const arr = [2, 3, 1, 5, 6, 4, 8]
console.log(getSequence(arr))
// 输出: [2, 3, 4, 6] 对应值 [1, 5, 6, 8]
```

**为什么用最长递增子序列？**

找到不需要移动的节点，只移动其他节点，最小化 DOM 操作。

```
旧: a b c d e f g
新: a c d b e f h

索引映射: [1, 3, 4, 2, 5, 6, 0]
最长递增子序列: [1, 3, 4, 5, 6]
对应节点: a c d e f

结果：只需要移动 b 和新增 h，其他节点不动
```

## 四、组件渲染流程

### 4.1 组件挂载流程

```js
/**
 * 组件挂载的完整流程
 */
function mountComponent(vnode, container) {
  // 1. 创建组件实例
  const instance = createComponentInstance(vnode)
  
  // 2. 设置组件实例
  setupComponent(instance)
  
  // 3. 设置并运行渲染副作用
  setupRenderEffect(instance, container)
}

/**
 * 创建组件实例
 */
function createComponentInstance(vnode) {
  const instance = {
    vnode,           // 组件的 VNode
    type: vnode.type, // 组件选项对象
    props: {},       // props 数据
    attrs: {},       // attrs 数据
    slots: {},       // 插槽数据
    ctx: {},         // 渲染上下文
    setupState: {},  // setup 返回的状态
    data: {},        // data 选项的状态
    isMounted: false, // 是否已挂载
    subTree: null,   // 组件渲染的子树 VNode
    update: null     // 组件的更新函数
  }
  
  instance.ctx = { _: instance }
  
  return instance
}

/**
 * 设置组件实例
 */
function setupComponent(instance) {
  const { props, children } = instance.vnode
  
  // 1. 处理 props
  initProps(instance, props)
  
  // 2. 处理 slots
  initSlots(instance, children)
  
  // 3. 执行 setup
  setupStatefulComponent(instance)
}

/**
 * 执行有状态组件的 setup
 */
function setupStatefulComponent(instance) {
  const Component = instance.type
  
  // 创建渲染代理
  instance.proxy = new Proxy(instance.ctx, {
    get({ _: instance }, key) {
      const { setupState, props, data } = instance
      
      // 按优先级从 setupState、data、props 中取值
      if (key in setupState) {
        return setupState[key]
      } else if (key in data) {
        return data[key]
      } else if (key in props) {
        return props[key]
      }
    },
    set({ _: instance }, key, value) {
      const { setupState, data, props } = instance
      
      if (key in setupState) {
        setupState[key] = value
      } else if (key in data) {
        data[key] = value
      } else if (key in props) {
        console.warn('Props are readonly')
        return false
      }
      return true
    }
  })
  
  // 执行 setup
  const { setup } = Component
  if (setup) {
    const setupContext = {
      attrs: instance.attrs,
      slots: instance.slots,
      emit: (event, ...args) => {
        const eventName = `on${event[0].toUpperCase()}${event.slice(1)}`
        const handler = instance.vnode.props[eventName]
        if (handler) {
          handler(...args)
        }
      }
    }
    
    // 执行 setup，收集依赖
    const setupResult = setup(instance.props, setupContext)
    
    // 处理 setup 返回值
    if (typeof setupResult === 'function') {
      // 返回渲染函数
      instance.render = setupResult
    } else if (typeof setupResult === 'object') {
      // 返回状态
      instance.setupState = proxyRefs(setupResult)
    }
  }
  
  // 如果没有 render 函数，使用 template 编译
  if (!instance.render) {
    if (Component.template) {
      instance.render = compile(Component.template)
    }
  }
}

/**
 * 设置渲染副作用
 */
function setupRenderEffect(instance, container) {
  const componentUpdateFn = () => {
    if (!instance.isMounted) {
      // 挂载阶段
      
      // 调用 beforeMount 钩子
      if (instance.bm) {
        instance.bm.forEach(hook => hook())
      }
      
      // 执行render函数，生成子树 VNode
      const subTree = (instance.subTree = instance.render.call(instance.proxy))
      
      // 挂载子树
      patch(null, subTree, container)
      
      // 保存根 DOM 元素
      instance.vnode.el = subTree.el
      
      // 标记为已挂载
      instance.isMounted = true
      
      // 调用 mounted 钩子
      if (instance.m) {
        instance.m.forEach(hook => hook())
      }
    } else {
      // 更新阶段
      
      // 调用 beforeUpdate 钩子
      if (instance.bu) {
        instance.bu.forEach(hook => hook())
      }
      
      const prevTree = instance.subTree
      const nextTree = instance.render.call(instance.proxy)
      instance.subTree = nextTree
      
      // patch 更新
      patch(prevTree, nextTree, container)
      
      // 调用 updated 钩子
      if (instance.u) {
        instance.u.forEach(hook => hook())
      }
    }
  }
  
  // 创建响应式副作用
  const effect = new ReactiveEffect(componentUpdateFn, () => {
    // 调度器：组件更新加入异步队列
    queueJob(instance.update)
  })
  
  const update = (instance.update = effect.run.bind(effect))
  
  // 初始执行
  update()
}
```

### 4.2 组件更新流程

```js
/**
 * 组件更新触发流程
 */

// 1. 响应式数据变化
state.count++

// 2. 触发 trigger
trigger(state, 'count')

// 3. 执行 effect 的 scheduler
effect.scheduler()

// 4. 将更新任务加入队列
queueJob(instance.update)

// 5. 在 nextTick 中批量执行更新
Promise.resolve().then(() => {
  flushJobs()
})

/**
 * 任务队列管理
 */
const queue = [] // 更新队列
let isFlushing = false
let isFlushPending = false

function queueJob(job) {
  // 去重
  if (!queue.includes(job)) {
    queue.push(job)
  }
  
  // 开始刷新队列
  queueFlush()
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  isFlushing = true
  
  // 按 id 排序，保证父组件先于子组件更新
  queue.sort((a, b) => a.id - b.id)
  
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i]
      job()
    }
  } finally {
    queue.length = 0
    isFlushing = false
  }
}
```

## 五、Composition API 实现原理

### 5.1 生命周期钩子实现

```js
// 当前组件实例
let currentInstance = null

export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}

/**
 * 生命周期钩子注册工厂函数
 */
function createHook(lifecycle) {
  return (hook, target = currentInstance) => {
    if (target) {
      // 将钩子函数添加到对应的生命周期数组中
      const hooks = target[lifecycle] || (target[lifecycle] = [])
      
      // 包装钩子函数，在执行时设置当前实例
      const wrappedHook = (...args) => {
        setCurrentInstance(target)
        const res = hook(...args)
        setCurrentInstance(null)
        return res
      }
      
      hooks.push(wrappedHook)
    }
  }
}

// 导出生命周期钩子
export const onBeforeMount = createHook('bm')
export const onMounted = createHook('m')
export const onBeforeUpdate = createHook('bu')
export const onUpdated = createHook('u')
export const onBeforeUnmount = createHook('bum')
export const onUnmounted = createHook('um')

// 使用示例
export default {
  setup() {
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onBeforeUpdate(() => {
      console.log('组件即将更新')
    })
  }
}
```

### 5.2 provide / inject 实现

```js
/**
 * provide 实现
 */
export function provide(key, value) {
  const currentInstance = getCurrentInstance()
  
  if (currentInstance) {
    let provides = currentInstance.provides
    const parentProvides = currentInstance.parent?.provides
    
    // 初始化时继承父级的 provides
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    
    provides[key] = value
  }
}

/**
 * inject 实现
 */
export function inject(key, defaultValue) {
  const currentInstance = getCurrentInstance()
  
  if (currentInstance) {
    // 从父级链中查找
    const provides = currentInstance.parent?.provides
    
    if (provides && key in provides) {
      return provides[key]
    } else if (arguments.length > 1) {
      return typeof defaultValue === 'function' 
        ? defaultValue() 
        : defaultValue
    } else {
      console.warn(`injection "${String(key)}" not found.`)
    }
  }
}

// 使用示例
// 祖先组件
export default {
  setup() {
    const theme = ref('dark')
    provide('theme', theme)
  }
}

// 后代组件
export default {
  setup() {
    const theme = inject('theme')
    // theme 是响应式的
  }
}
```

### 5.3 watch 实现

```js
/**
 * watch 实现
 */
export function watch(source, cb, options = {}) {
  let getter
  let oldValue
  
  // 处理不同类型的 source
  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => traverse(source)
    options.deep = true
  } else if (isFunction(source)) {
    getter = source
  } else {
    getter = () => {}
  }
  
  // 深度遍历，触发所有属性的 getter
  function traverse(value, seen = new Set()) {
    if (!isObject(value) || seen.has(value)) {
      return value
    }
    seen.add(value)
    for (const key in value) {
      traverse(value[key], seen)
    }
    return value
  }
  
  // 清理函数
  let cleanup
  const onCleanup = (fn) => {
    cleanup = fn
  }
  
  const job = () => {
    // 执行清理函数
    if (cleanup) {
      cleanup()
    }
    
    const newValue = effect.run()
    cb(newValue, oldValue, onCleanup)
    oldValue = newValue
  }
  
  const effect = new ReactiveEffect(getter, () => {
    if (options.flush === 'post') {
      // 在组件更新后执行
      queuePostFlushCb(job)
    } else if (options.flush === 'sync') {
      // 同步执行
      job()
    } else {
      // 默认：在组件更新前执行
      queuePreFlushCb(job)
    }
  })
  
  if (options.immediate) {
    job()
  } else {
    oldValue = effect.run()
  }
  
  // 返回停止函数
  return () => {
    effect.stop()
    if (cleanup) {
      cleanup()
    }
  }
}
```

### 5.4 watchEffect 实现

```js
/**
 * watchEffect 实现
 */
export function watchEffect(effect, options = {}) {
  return doWatch(effect, null, options)
}

function doWatch(source, cb, { immediate, deep, flush } = {}) {
  let cleanup
  const onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      fn()
    }
  }
  
  const job = () => {
    if (cleanup) {
      cleanup()
    }
    
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue, onCleanup)
        oldValue = newValue
      }
    } else {
      // watchEffect
      effect.run()
    }
  }
  
  const effect = new ReactiveEffect(source, () => {
    if (flush === 'sync') {
      job()
    } else {
      queueJob(job)
    }
  })
  
  // watchEffect 立即执行
  if (!cb) {
    effect.run()
  } else if (immediate) {
    job()
  }
  
  return () => {
    effect.stop()
  }
}
```

## 六、性能优化原理

### 6.1 Block Tree

Vue3 引入了 Block Tree 的概念，将动态节点收集到一个数组中。

```js
// 模板
const template = `
<div>
  <p>静态文本1</p>
  <p>{{ dynamic1 }}</p>
  <p>静态文本2</p>
  <p>{{ dynamic2 }}</p>
</div>
`

// 编译后
function render(_ctx) {
  return (_openBlock(), _createBlock("div", null, [
    _createVNode("p", null, "静态文本1"),
    _createVNode("p", null, _toDisplayString(_ctx.dynamic1), 1 /* TEXT */),
    _createVNode("p", null, "静态文本2"),
    _createVNode("p", null, _toDisplayString(_ctx.dynamic2), 1 /* TEXT */)
  ]))
}

// Block Tree 结构
const block = {
  type: 'div',
  children: [...],
  dynamicChildren: [ // 只包含动态节点
    { type: 'p', children: ctx.dynamic1, patchFlag: 1 },
    { type: 'p', children: ctx.dynamic2, patchFlag: 1 }
  ]
}

// diff 时只需要遍历 dynamicChildren
function patchBlockChildren(oldBlock, newBlock) {
  const oldDynamicChildren = oldBlock.dynamicChildren
  const newDynamicChildren = newBlock.dynamicChildren
  
  for (let i = 0; i < newDynamicChildren.length; i++) {
    patchElement(oldDynamicChildren[i], newDynamicChildren[i])
  }
}
```

### 6.2 编译时优化总结

| 优化策略 | 说明 | 收益 |
|---------|------|------|
| **静态提升** | 静态节点提升到渲染函数外 | 减少创建开销 |
| **Patch Flag** | 标记动态内容类型 | 精确更新 |
| **Block Tree** | 收集动态节点到数组 | 跳过静态节点 |
| **事件缓存** | 缓存事件处理函数 | 减少函数创建 |
| **静态属性提升** | 静态属性提升到外部 | 减少对象创建 |

### 6.3 运行时优化

#### 异步更新队列

```js
/**
 * 批量更新机制
 */
const queue = []
const resolvedPromise = Promise.resolve()
let currentFlushPromise = null

function queueJob(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  try {
    for (let i = 0; i < queue.length; i++) {
      queue[i]()
    }
  } finally {
    queue.length = 0
    currentFlushPromise = null
  }
}

// 示例：多次修改只触发一次更新
state.count = 1
state.count = 2
state.count = 3
// 只会执行一次 DOM 更新
```

#### Tree-shaking

Vue3 的所有 API 都支持 Tree-shaking：

```js
// 只导入使用的 API
import { ref, computed } from 'vue'
// watch、reactive 等未使用的 API 不会被打包

// 打包后体积更小
// Vue2: ~32kb
// Vue3: ~14kb (只使用核心功能)
```

## 七、总结

### 7.1 Vue3 核心架构

```
┌─────────────────────────────────────┐
│         Compiler（编译器）           │
│  Template → AST → Transform → Code  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        Renderer（渲染器）            │
│    VNode → Diff → Patch → DOM       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Reactivity（响应式系统）         │
│  Proxy → Track → Trigger → Effect   │
└─────────────────────────────────────┘
```

### 7.2 性能提升原因

1. **响应式系统**：Proxy 替代 Object.defineProperty
2. **编译器优化**：Patch Flag、静态提升、Block Tree
3. **Diff 算法**：最长递增子序列优化
4. **组件初始化**：更快的创建和更新
5. **Tree-shaking**：按需引入，减小体积

### 7.3 设计哲学

- **渐进式**：可以只用一部分功能
- **组合式**：Composition API 提供更好的逻辑复用
- **类型友好**：完整的 TypeScript 支持
- **性能优先**：编译时 + 运行时双重优化
- **向前兼容**：支持 Vue2 的 Options API

## 八、参考资源

- [Vue3 官方文档](https://cn.vuejs.org/)
- [Vue3 源码仓库](https://github.com/vuejs/core)
- [Vue3 设计与实现（书籍）](https://github.com/HcySunYang/code-for-vue-3-book)
- [Vue3 Template Explorer](https://template-explorer.vuejs.org/)
- [Vue3 技术揭秘](https://vue3js.cn/start/)

