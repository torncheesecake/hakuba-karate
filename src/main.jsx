import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/site.css'

const application = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
const root = document.getElementById('root')
const pagePath = window.location.pathname.replace(/\/$/, '') || '/'
// A selected enquiry is personalised by its query, unlike the static contact HTML.
const personalisedEnquiry = window.location.pathname.replace(/\/$/, '') === '/contact' && ['location', 'interest', 'session'].some((key) => new window.URLSearchParams(window.location.search).has(key))
if (root.dataset.pagePath === pagePath && !personalisedEnquiry) ReactDOM.hydrateRoot(root, application)
else ReactDOM.createRoot(root).render(application)
