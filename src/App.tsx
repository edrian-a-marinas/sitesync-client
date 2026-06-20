import { BrowserRouter } from 'react-router-dom'
import Router from '@/router'

import { AuthProvider } from '@/lib/AuthContext'
//import { ThemeProvider } from "@ccs"


export default function App() {
  return (
    <BrowserRouter>
    {/* <ThemeProvider> */}
      <AuthProvider> 
        <Router />
      </AuthProvider>
    {/*</ThemeProvider> */}
    </BrowserRouter>
  )
}