import React from 'react'; //{ Suspense }
import {
    Route, Routes
} from "react-router-dom";
import Home from './Page/Home.js';
import Snake from './Page/Snake.js';
function Routers() {
    return (

        <React.Fragment>
            <Routes>
                {/* <Suspense fallback={<Loader />} > */}
                {/* <PrivateRoutes exact path='/' component={LoginDemo}></PrivateRoutes> */}
                <Route path='/' element={<Home />}></Route>
                <Route path='/Snake-game' element={<Snake />}></Route>
                {/* </Suspense> */}</Routes>
        </React.Fragment>
    )
}

export default Routers
