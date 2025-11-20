# React Hooks

React Hooks 是 React 16.8 引入的新特性，允许你在函数组件中使用状态和其他 React 特性。

## 为什么需要 Hooks

- 在函数组件中使用状态
- 复用状态逻辑
- 简化组件代码
- 更好的代码组织

## 基础 Hooks

### useState

`useState` 用于在函数组件中添加状态。

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
}
```

### useEffect

`useEffect` 用于处理副作用，相当于 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 的组合。

```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 组件挂载和更新时执行
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));

    // 清理函数（可选）
    return () => {
      console.log('清理工作');
    };
  }, [userId]); // 依赖数组，只有 userId 变化时才重新执行

  if (!user) return <div>加载中...</div>;

  return <div>{user.name}</div>;
}
```

### useContext

`useContext` 用于在函数组件中访问 Context。

```jsx
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>按钮</button>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}
```

## 额外的 Hooks

### useReducer

`useReducer` 是 `useState` 的替代方案，适用于复杂的状态逻辑。

```jsx
import React, { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>计数: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>增加</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>减少</button>
    </div>
  );
}
```

### useMemo

`useMemo` 用于缓存计算结果，避免不必要的重复计算。

```jsx
import React, { useMemo, useState } from 'react';

function ExpensiveComponent({ items }) {
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);

  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useCallback

`useCallback` 用于缓存函数，避免不必要的函数重新创建。

```jsx
import React, { useState, useCallback } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 依赖数组为空，函数不会改变

  return <Child onClick={handleClick} />;
}

function Child({ onClick }) {
  return <button onClick={onClick}>点击</button>;
}
```

### useRef

`useRef` 用于获取 DOM 元素或保存可变值。

```jsx
import React, { useRef, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
}
```

### useImperativeHandle

`useImperativeHandle` 用于自定义暴露给父组件的实例值。

```jsx
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

const FancyInput = forwardRef((props, ref) => {
  const inputRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));

  return <input ref={inputRef} />;
});

function App() {
  const fancyInputRef = useRef();

  return (
    <div>
      <FancyInput ref={fancyInputRef} />
      <button onClick={() => fancyInputRef.current.focus()}>
        聚焦输入框
      </button>
    </div>
  );
}
```

### useLayoutEffect

`useLayoutEffect` 与 `useEffect` 类似，但在 DOM 更新后同步执行。

```jsx
import React, { useLayoutEffect, useRef } from 'react';

function Tooltip() {
  const tooltipRef = useRef();

  useLayoutEffect(() => {
    // 在浏览器绘制之前执行
    const { width } = tooltipRef.current.getBoundingClientRect();
    console.log('工具提示宽度:', width);
  });

  return <div ref={tooltipRef}>工具提示</div>;
}
```

## 自定义 Hooks

自定义 Hooks 是复用状态逻辑的方式，以 `use` 开头。

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return <div>{data.name}</div>;
}
```

## Hooks 规则

1. **只在顶层调用 Hooks**：不要在循环、条件或嵌套函数中调用
2. **只在 React 函数中调用 Hooks**：在函数组件或自定义 Hooks 中调用

```jsx
// ❌ 错误示例
function Component() {
  if (condition) {
    const [state, setState] = useState(0); // 错误！
  }
}

// ✅ 正确示例
function Component() {
  const [state, setState] = useState(0); // 正确
  if (condition) {
    // 使用 state
  }
}
```

## 总结

React Hooks 让函数组件具备了类组件的功能，使代码更简洁、更易复用。掌握常用 Hooks 的使用方法是现代 React 开发的基础。


