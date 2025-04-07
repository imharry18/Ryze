import { useState } from 'react'
import Navbar from './components/navbar'
import Body from './components/body'
import Landing from './components/landing'
import Footer from './components/footer'
import './App.css'
import './index.css'

function App() {

  return (
    <>
      <div><Navbar /></div>
      <Landing />
      <Footer />
    </>
  )
}

export default App
