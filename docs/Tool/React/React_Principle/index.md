# React 核心原理

深入理解 React 的底层实现原理，从源码角度分析 React 的核心机制。

## 虚拟 DOM

### 什么是虚拟 DOM

虚拟 DOM 是 React 用 JavaScript 对象来描述真实 DOM 的一种方式。

```jsx
// JSX
<div className="container">
  <h1>标题</h1>
  <p>内容</p>
</div>

// 对应的虚拟 DOM 对象
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: '标题' }
      },
      {
        type: 'p',
        props: { children: '内容' }
      }
    ]
  }
}
```

### 为什么使用虚拟 DOM

1. **性能优化**：减少直接操作 DOM 的次数
2. **跨平台**：可以渲染到不同平台（Web、Native、Canvas）
3. **声明式编程**：更直观地描述 UI

## Diff 算法

React 使用 Diff 算法来比较新旧虚拟 DOM，找出需要更新的部分。

### Diff 策略

1. **Tree Diff**：逐层比较，只比较同层节点
2. **Component Diff**：同类型组件继续比较，不同类型直接替换
3. **Element Diff**：使用 key 来优化列表比较

```jsx
// 旧虚拟 DOM
<ul>
  <li key="1">A</li>
  <li key="2">B</li>
  <li key="3">C</li>
</ul>

// 新虚拟 DOM
<ul>
  <li key="3">C</li>
  <li key="1">A</li>
  <li key="2">B</li>
</ul>

// React 会通过 key 识别出只是顺序变化，进行移动而非重新创建
```

## Fiber 架构

React 16 引入了 Fiber 架构，实现了可中断的渲染过程。

### Fiber 节点

Fiber 是 React 的最小工作单元，每个 Fiber 节点对应一个组件或 DOM 节点。

```javascript
// Fiber 节点结构（简化）
{
  type: 'div',           // 节点类型
  key: null,             // key
  child: null,           // 第一个子节点
  sibling: null,         // 下一个兄弟节点
  return: null,          // 父节点
  alternate: null,       // 对应的旧 Fiber
  effectTag: null,       // 副作用标记
  updateQueue: null,     // 更新队列
  memoizedState: null,   // 记忆的状态
}
```

### Fiber 工作流程

1. **Render 阶段**：可中断，构建 Fiber 树
2. **Commit 阶段**：不可中断，执行 DOM 更新

### 时间切片

Fiber 使用时间切片技术，将工作分成小的时间片，避免阻塞主线程。

```javascript
// 伪代码
function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  requestIdleCallback(workLoop);
}
```

## 事件系统

React 使用事件委托机制，所有事件都委托到 document（React 17+ 委托到根容器）。

### 合成事件（SyntheticEvent）

React 封装了原生事件，提供了跨浏览器的一致性。

```jsx
function Button() {
  const handleClick = (e) => {
    e.preventDefault();        // 阻止默认行为
    e.stopPropagation();      // 阻止冒泡
    console.log(e.nativeEvent); // 访问原生事件
  };

  return <button onClick={handleClick}>点击</button>;
}
```

### 事件池

React 17 之前使用事件池来复用事件对象，17 之后移除了事件池。

## 状态更新机制

### setState 原理

`setState` 是异步的，React 会批量更新状态。

```jsx
class Component extends React.Component {
  state = { count: 0 };

  handleClick = () => {
    // 批量更新
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    // 最终 count 只增加 1
  };

  handleClick2 = () => {
    // 函数式更新
    this.setState(prevState => ({ count: prevState.count + 1 }));
    this.setState(prevState => ({ count: prevState.count + 1 }));
    // 最终 count 增加 2
  };
}
```

### 更新队列

React 将多个 `setState` 调用合并到更新队列中，统一处理。

## Hooks 原理

### Hooks 存储

Hooks 存储在 Fiber 节点的 `memoizedState` 中，以链表形式组织。

```javascript
// 伪代码
let currentHook = null;
let workInProgressHook = null;

function useState(initialState) {
  const hook = {
    memoizedState: initialState,
    queue: null,
    next: null
  };

  if (workInProgressHook) {
    workInProgressHook.next = hook;
  } else {
    fiber.memoizedState = hook;
  }
  workInProgressHook = hook;

  return [hook.memoizedState, dispatchAction];
}
```

### 依赖数组原理

`useEffect` 的依赖数组通过浅比较来判断是否需要重新执行。

```javascript
function useEffect(effect, deps) {
  const prevDeps = currentHook.memoizedState;
  
  if (deps === null || !areHookInputsEqual(deps, prevDeps)) {
    effect();
  }
  
  currentHook.memoizedState = deps;
}
```

## 性能优化原理

### React.memo

`React.memo` 通过浅比较 props 来决定是否重新渲染。

```jsx
const MemoComponent = React.memo(function Component({ name }) {
  return <div>{name}</div>;
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return prevProps.name === nextProps.name;
});
```

### useMemo 和 useCallback

`useMemo` 和 `useCallback` 通过依赖数组来决定是否重新计算。

```jsx
const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]); // 只有 a 或 b 变化时才重新计算
```

## 总结

理解 React 的核心原理有助于：
- 编写更高效的代码
- 更好地进行性能优化
- 解决复杂问题
- 深入理解框架设计思想

React 的核心在于虚拟 DOM、Diff 算法、Fiber 架构和事件系统，这些机制共同构成了 React 的高效渲染能力。


