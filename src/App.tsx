import { PageSwitcher } from './components/PageSwitcher';
import { PageSwitcherProvider } from './components/context/PageSwitcherContext';
import { HomePage } from './components/HomePage';
import { NavBar } from './components/NavBar';
import { AboutPage } from './components/AboutPage';
import { AppsPage } from './components/AppsPage';
import { NotificatorProvider } from './components/context/NotificatorContext';
import { Notificator } from './components/Notificator';

function App() {
    const pages = [
        {
            id: "home",
            title: "Home",
            component: <HomePage/>
        },
        {
            id: "about",
            title: "About",
            component: <AboutPage/>
        },
        {
            id: "apps",
            title: "Apps",
            component: <AppsPage/>
        }
    ]
    return (
        <PageSwitcherProvider pages={pages}>
            <NotificatorProvider>
                <>
                    <PageSwitcher/>
                    <NavBar/>
                    <Notificator />
                </>
            </NotificatorProvider>
        </PageSwitcherProvider>
    );
}

export default App;
