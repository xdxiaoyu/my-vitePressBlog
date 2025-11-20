# React 基础

React 是一个用于构建用户界面的 JavaScript 库，由 Facebook 开发并维护。

## 核心概念

### JSX 语法

JSX 是 JavaScript 的语法扩展，允许我们在 JavaScript 中编写类似 HTML 的代码。

```jsx
const element = <h1>Hello, React!</h1>;
```

### 组件

React 组件是构建用户界面的基本单元，可以是函数组件或类组件。

#### 函数组件

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
```

#### 类组件

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

### Props

Props（属性）是组件之间传递数据的方式，是只读的。

```jsx
function User(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.email}</p>
    </div>
  );
}

<User name="张三" email="zhangsan@example.com" />
```

### State

State 是组件的内部状态，可以通过 `setState` 方法更新。

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <div>
        <p>计数: {this.state.count}</p>
        <button onClick={this.increment}>增加</button>
      </div>
    );
  }
}
```

### 生命周期

React 类组件有多个生命周期方法，可以在组件的不同阶段执行代码。

#### 挂载阶段

- `constructor()` - 组件初始化
- `render()` - 渲染组件
- `componentDidMount()` - 组件挂载后

#### 更新阶段

- `componentDidUpdate()` - 组件更新后
- `shouldComponentUpdate()` - 决定是否更新

#### 卸载阶段

- `componentWillUnmount()` - 组件卸载前

```jsx
class MyComponent extends React.Component {
  componentDidMount() {
    console.log('组件已挂载');
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('组件已更新');
  }

  componentWillUnmount() {
    console.log('组件即将卸载');
  }

  render() {
    return <div>My Component</div>;
  }
}
```

### 事件处理

React 使用驼峰命名法处理事件，事件处理函数需要绑定 `this`。

```jsx
class Button extends React.Component {
  handleClick = (e) => {
    e.preventDefault();
    console.log('按钮被点击');
  }

  render() {
    return <button onClick={this.handleClick}>点击我</button>;
  }
}
```

### 条件渲染

可以使用 if 语句、三元运算符或逻辑与运算符进行条件渲染。

```jsx
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>欢迎回来！</h1>;
  }
  return <h1>请先登录</h1>;
}

// 或使用三元运算符
function Greeting({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? <h1>欢迎回来！</h1> : <h1>请先登录</h1>}
    </div>
  );
}
```

### 列表渲染

使用 `map()` 方法渲染列表，需要为每个元素添加 `key` 属性。

```jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### 表单处理

React 中的表单元素是受控组件，值由 React 状态控制。

```jsx
class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log('提交的值:', this.state.value);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <button type="submit">提交</button>
      </form>
    );
  }
}
```

## 最佳实践

1. **组件拆分**：将大组件拆分为小组件，提高可维护性
2. **Props 验证**：使用 PropTypes 或 TypeScript 验证 Props
3. **Key 的使用**：列表渲染时使用稳定的唯一标识作为 key
4. **避免直接修改 State**：使用 `setState` 更新状态
5. **性能优化**：合理使用 `shouldComponentUpdate` 或 `React.memo`

## 总结

React 基础包括 JSX、组件、Props、State、生命周期等核心概念，掌握这些是学习 React 的基础。


