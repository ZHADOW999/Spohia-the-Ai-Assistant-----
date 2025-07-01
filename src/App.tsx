import "./index.css"
import { BrowserRouter, Route, Routes } from 'react-router'
import Home from './index'
import Test2 from './test2'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Home/>} path="/" />
        <Route element={<Test2/>} path="/test2" />
      </Routes>
    </BrowserRouter>
  )
}

export default App 