import React from 'react'; //{ Suspense }
import {
    Route, Switch
} from "react-router-dom";
import Home from './Page/Home.js';
import Snake from './Page/Snake.js';
function Routers() {
    return (

        <React.Fragment>
            <Switch>
                {/* <Suspense fallback={<Loader />} > */}
                {/* <PrivateRoutes exact path='/' component={LoginDemo}></PrivateRoutes> */}
                <Route exact path='/' render={(props) => <Home {...props} />}></Route>
                <Route exact path='/snake-game' render={(props) => <Snake {...props} />}></Route>
                {/* </Suspense> */}
            </Switch>
        </React.Fragment>
    )
}

export default Routers
