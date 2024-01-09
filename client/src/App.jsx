import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'
import Project from './Project'
import Dashboard from './Dashboard'


function App() {
  return (
   <BrowserRouter>
   <Routes>
   <Route path="/" element={<Signup/>}/>
    <Route path='/register' element={<Signup />}></Route>
    <Route path='/login' element={<Login />}></Route>
    <Route path="/dashboard/:userId" element={<Dashboard />} />
    <Route path="/project/:userId/:projectId" element={<Project />} />
   </Routes>
   </BrowserRouter>
  )
}

export default App
