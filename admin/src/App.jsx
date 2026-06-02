import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import ArticleEdit from './pages/ArticleEdit';
import Videos from './pages/Videos';
import Categories from './pages/Categories';
import Design from './pages/Design';
import Media from './pages/Media';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routing redirect for admin panel base */}
          <Route path="/admin" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/new" element={<ArticleEdit />} />
            <Route path="articles/edit/:id" element={<ArticleEdit />} />
            <Route path="videos" element={<Videos />} />
            <Route path="categories" element={<Categories />} />
            <Route path="design" element={<Design />} />
            <Route path="media" element={<Media />} />
          </Route>
          
          <Route path="/admin/login" element={<Login />} />
          
          {/* Fallback route redirect to dashboard */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
