import './App.scss';

import {
    HashRouter,
} from "react-router-dom";
import Routers from './Router';

function App() {
    return (
        <HashRouter hashType='noslash'>
            <Routers />
        </HashRouter>
    );
}

export default App;



