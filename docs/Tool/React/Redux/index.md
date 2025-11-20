# Redux 状态管理

Redux 是 JavaScript 应用的可预测状态容器，用于管理应用的状态。

## 核心概念

### Store

Store 是保存应用状态的对象，整个应用只有一个 Store。

```javascript
import { createStore } from 'redux';

const store = createStore(reducer);
```

### State

State 是应用的状态数据，是只读的。

```javascript
const state = store.getState();
```

### Action

Action 是描述发生了什么的对象，必须包含 `type` 属性。

```javascript
const action = {
  type: 'INCREMENT',
  payload: 1
};
```

### Reducer

Reducer 是纯函数，根据 Action 更新 State。

```javascript
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + action.payload };
    case 'DECREMENT':
      return { count: state.count - action.payload };
    default:
      return state;
  }
}
```

### Dispatch

Dispatch 是触发 Action 的方法。

```javascript
store.dispatch({ type: 'INCREMENT', payload: 1 });
```

## 基础使用

### 创建 Store

```javascript
import { createStore } from 'redux';

const initialState = { count: 0 };

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

const store = createStore(counterReducer);
```

### 订阅更新

```javascript
const unsubscribe = store.subscribe(() => {
  console.log('状态更新:', store.getState());
});

// 取消订阅
unsubscribe();
```

### 在 React 中使用

```jsx
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore } from 'redux';

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

// Store
const store = createStore(counterReducer);

// 组件
function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>增加</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>减少</button>
    </div>
  );
}

// App
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

## Action Creators

Action Creators 是创建 Action 的函数。

```javascript
// Action Creators
function increment(payload) {
  return { type: 'INCREMENT', payload };
}

function decrement(payload) {
  return { type: 'DECREMENT', payload };
}

// 使用
store.dispatch(increment(1));
store.dispatch(decrement(1));
```

## 中间件

### 使用中间件

Redux 中间件可以拦截 Action，进行异步操作、日志记录等。

```javascript
import { applyMiddleware } from 'redux';
import logger from 'redux-logger';

const store = createStore(
  reducer,
  applyMiddleware(logger)
);
```

### 自定义中间件

```javascript
const logger = store => next => action => {
  console.log('派发 Action:', action);
  const result = next(action);
  console.log('更新后状态:', store.getState());
  return result;
};

const store = createStore(reducer, applyMiddleware(logger));
```

## 异步操作

### Redux Thunk

使用 Redux Thunk 处理异步操作。

```javascript
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// Action Creator（返回函数）
function fetchUser(userId) {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_USER_START' });
    try {
      const user = await api.getUser(userId);
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'FETCH_USER_ERROR', payload: error });
    }
  };
}

const store = createStore(reducer, applyMiddleware(thunk));

// 使用
store.dispatch(fetchUser(123));
```

## Redux Toolkit

Redux Toolkit 是 Redux 官方推荐的简化写法。

### 安装

```bash
npm install @reduxjs/toolkit react-redux
```

### 使用 createSlice

```javascript
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1; // 可以直接修改（使用了 Immer）
    },
    decrement: (state) => {
      state.count -= 1;
    },
    incrementByAmount: (state, action) => {
      state.count += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

### 配置 Store

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});
```

### 异步操作（createAsyncThunk）

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await api.getUser(userId);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { user: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});
```

## 最佳实践

1. **单一数据源**：整个应用只有一个 Store
2. **State 只读**：只能通过 Action 修改 State
3. **纯函数 Reducer**：Reducer 必须是纯函数
4. **使用 Redux Toolkit**：简化 Redux 代码
5. **合理拆分 Reducer**：使用 `combineReducers` 拆分

```javascript
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer,
  todos: todosReducer
});
```

## 总结

Redux 提供了可预测的状态管理方案：
- 单一数据源
- 状态只读
- 纯函数更新
- 支持中间件和异步操作
- Redux Toolkit 简化开发

掌握 Redux 可以更好地管理复杂应用的状态。


