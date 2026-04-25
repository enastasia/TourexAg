import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './AppProvider';
import { AppRouter } from '../router/AppRouter';

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </AppProvider>
);

export default App;
