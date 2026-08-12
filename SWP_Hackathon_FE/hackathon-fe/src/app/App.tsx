import {NotificationProvider }  from '../context/NotificationContext'
import AppRoutes from './AppRoutes'
import NotificationToast from '../context/Notification'
import { TeamProvider } from '../context/TeamContext'

function App() {
  return (
    <>
      <NotificationProvider>
        <NotificationToast />
        <TeamProvider>
          <AppRoutes />
        </TeamProvider>
      </NotificationProvider>
    </>
  )
}

export default App
