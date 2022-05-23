import React from 'react'

const Sidebar = () => {
    return (
        <div className='sidebar'>
            <div className='logo'></div>
            <div className='menus'>
                <ul>
                    {/* <li>
                        <a href='/'>About</a>
                    </li>
                    <li>
                        <a href='/'>My Skills</a>
                    </li>
                    <li>
                        <a href='/'>Work</a>
                    </li>
                    <li>
                        <a href='/'>Resume</a>
                    </li>
                    <li>
                        <a href='/'>Contact</a>
                    </li> */}

                </ul>

            </div>
            <div className='social'>
                <span><a href="https://github.com/jaypavasiya/">
                    <svg aria-hidden="true" focusable="false" data-prefix="fab" width="15px" height="15px" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" ><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" class=""></path></svg>
                </a></span>
                <span><a href="https://in.linkedin.com/in/jay-pavasiya-22520516b">
                    <svg aria-hidden="true" focusable="false" width="15px" height="15px" data-prefix="fab" data-icon="linkedin-in" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" class=""></path></svg>
                </a></span>
                <span><a href="https://twitter.com/jay_pavasiya">
                    <svg aria-hidden="true" viewBox="0 0 30 30" width="15px" height="15px" xmlns="http://www.w3.org/2000/svg">    <path fill="currentColor" d="M28,6.937c-0.957,0.425-1.985,0.711-3.064,0.84c1.102-0.66,1.947-1.705,2.345-2.951c-1.03,0.611-2.172,1.055-3.388,1.295 c-0.973-1.037-2.359-1.685-3.893-1.685c-2.946,0-5.334,2.389-5.334,5.334c0,0.418,0.048,0.826,0.138,1.215 c-4.433-0.222-8.363-2.346-10.995-5.574C3.351,6.199,3.088,7.115,3.088,8.094c0,1.85,0.941,3.483,2.372,4.439 c-0.874-0.028-1.697-0.268-2.416-0.667c0,0.023,0,0.044,0,0.067c0,2.585,1.838,4.741,4.279,5.23 c-0.447,0.122-0.919,0.187-1.406,0.187c-0.343,0-0.678-0.034-1.003-0.095c0.679,2.119,2.649,3.662,4.983,3.705 c-1.825,1.431-4.125,2.284-6.625,2.284c-0.43,0-0.855-0.025-1.273-0.075c2.361,1.513,5.164,2.396,8.177,2.396 c9.812,0,15.176-8.128,15.176-15.177c0-0.231-0.005-0.461-0.015-0.69C26.38,8.945,27.285,8.006,28,6.937z" /></svg>
                </a></span>
                <span><a href="mailto:jaypavasiya7@gmail,com.com">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" fill="currentColor" viewBox="0 0 1024 1024" ><path fill="currentColor" d="M512 16C238.064 16 16 238.064 16 512s222.064 496 496 496 496-222.064 496-496S785.936 16 512 16zM307.488 346.672l409.008 0c5.184 0 10.064 1.232 14.464 3.296l-196.688 138.064c-17.104 17.12-27.696 17.12-44.8 0l-196.608-137.984C297.328 347.936 302.24 346.672 307.488 346.672zM750.816 652.192c0 18.96-15.36 34.336-34.304 34.336L307.488 686.528c-18.944 0-34.304-15.376-34.304-34.336L273.184 391.296c0-1.728 0.256-3.376 0.512-5.024l201.92 143.312c20.096 20.112 52.688 20.112 72.784 0l201.92-143.312c0.24 1.648 0.512 3.296 0.512 5.024L750.832 652.192z" /></svg>
                </a></span>
            </div>
        </div>
    )
}

export default Sidebar 