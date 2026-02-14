import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router'
import { ToastContainer, toast } from 'react-toastify';
import { useAuthInitialization } from './hooks/initialization.hooks';
import { Spinner } from './components/ui/spinner';

function App() {

  const { isInitialized } = useAuthInitialization();

  if (!isInitialized) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner className='size-10'/>
      </div>
    )
  }

  return (
    <div>
      <RouterProvider router={router} />
      <ToastContainer
        stacked
        hideProgressBar
        position='bottom-right'
      />
    </div>
  )
}

export default App
