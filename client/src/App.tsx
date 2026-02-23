import { RouterProvider } from 'react-router-dom'
import './App.css'
import { router } from './router'
import { useAuthInitialization } from './hooks/initialization.hooks';
import { Spinner } from './components/ui/spinner';
import { useNotifications } from './hooks/notification.hooks';
import { Toaster } from 'sonner';

function App() {

  const { isInitialized } = useAuthInitialization();
  useNotifications();

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
      <Toaster />
    </div>
  )
}

export default App
