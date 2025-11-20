# React Router

React Router 是 React 应用的路由库，用于实现单页应用（SPA）的路由功能。

## 安装

```bash
npm install react-router-dom
# 或
yarn add react-router-dom
```

## 基础使用

### BrowserRouter

使用 `BrowserRouter` 包裹应用，启用 HTML5 历史记录 API。

```jsx
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      {/* 路由配置 */}
    </BrowserRouter>
  );
}
```

### Routes 和 Route

使用 `Routes` 和 `Route` 定义路由。

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Link 和 NavLink

使用 `Link` 和 `NavLink` 进行导航。

```jsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <Link to="/">首页</Link>
      <Link to="/about">关于</Link>
      <NavLink to="/contact" activeClassName="active">
        联系
      </NavLink>
    </nav>
  );
}
```

## 路由参数

### 路径参数

使用 `:param` 定义路径参数。

```jsx
<Route path="/user/:id" element={<User />} />

// 在组件中获取参数
import { useParams } from 'react-router-dom';

function User() {
  const { id } = useParams();
  return <div>用户 ID: {id}</div>;
}
```

### 查询参数

使用 `useSearchParams` 获取查询参数。

```jsx
import { useSearchParams } from 'react-router-dom';

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword');

  return (
    <div>
      <input
        value={keyword || ''}
        onChange={e => setSearchParams({ keyword: e.target.value })}
      />
    </div>
  );
}
```

## 嵌套路由

使用嵌套的 `Route` 实现嵌套路由。

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="products" element={<Products />}>
      <Route index element={<ProductList />} />
      <Route path=":id" element={<ProductDetail />} />
    </Route>
  </Route>
</Routes>

// Layout 组件中使用 Outlet
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div>
      <Navigation />
      <Outlet /> {/* 子路由渲染位置 */}
    </div>
  );
}
```

## 编程式导航

使用 `useNavigate` 进行编程式导航。

```jsx
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 登录逻辑
    navigate('/dashboard'); // 导航到仪表盘
  };

  return <button onClick={handleLogin}>登录</button>;
}
```

## 路由守卫

通过条件渲染实现路由守卫。

```jsx
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = checkAuth();

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// 使用
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```

## 路由配置

### 路由表配置

使用配置对象定义路由。

```jsx
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> }
    ]
  }
];

// 使用 useRoutes
import { useRoutes } from 'react-router-dom';

function App() {
  const element = useRoutes(routes);
  return element;
}
```

## 懒加载

使用 `React.lazy` 和 `Suspense` 实现路由懒加载。

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

## 常用 Hooks

### useLocation

获取当前路由位置信息。

```jsx
import { useLocation } from 'react-router-dom';

function Component() {
  const location = useLocation();
  console.log(location.pathname); // 当前路径
  console.log(location.search);   // 查询字符串
  console.log(location.state);    // 状态
}
```

### useMatch

检查当前路径是否匹配指定模式。

```jsx
import { useMatch } from 'react-router-dom';

function Component() {
  const match = useMatch('/user/:id');
  if (match) {
    console.log(match.params.id);
  }
}
```

## 总结

React Router 提供了完整的路由解决方案，包括：
- 路由定义和导航
- 路由参数和查询参数
- 嵌套路由
- 编程式导航
- 路由守卫
- 懒加载

掌握这些功能可以构建复杂的单页应用路由系统。


