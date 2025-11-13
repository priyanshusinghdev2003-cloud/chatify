import React, { useEffect } from 'react'
import {Routes,Route, Navigate} from "react-router"
import ChatPage from "./pages/ChatPage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Galaxy from './Galaxy';
import { useAuthStore } from './store/useAuthStore'
import PageLoader from './components/PageLoader'
import {Toaster} from "react-hot-toast"

function App() {
  const {checkAuth,isCheckingAuth,authUser} = useAuthStore()


  useEffect(()=>{
    checkAuth()
  },[checkAuth])

if(isCheckingAuth) return  <PageLoader />
  return (
     <div className='min-h-screen relative z-0 flex justify-center items-center p-4 overflow-hidden'>
  <Galaxy 
    density={1}
    glowIntensity={0.2}
    saturation={0.2}
    hueShift={240}
  
  />

    <Routes>
      <Route path='/' element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
      <Route path='/login' element={!authUser ? <Login /> : <Navigate to={"/"} />} />
      <Route path='/signup' element={!authUser ? <Signup /> : <Navigate to={"/"} />} />
    </Routes>
    <Toaster />
    </div>
  )
}

export default App