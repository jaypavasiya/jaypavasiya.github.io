import React from 'react'
import Typewriter from "typewriter-effect";

const Profile = () => {
  const arr = new Array(300).fill(0)
  console.log(arr);
  return (
    <>
      <div className='home_section'>
        <div className='top_Section'>
          <div>
            <div className='title'>
              <h1>JAY PAVASIYA</h1>
            </div>
            <div className='sub_title'>
              <Typewriter
                options={{
                  strings: ['Font-End Developer', 'JavaScript | React | Angular | NodeJS ', 'HTML | CSS | SASS | Bootstrap', 'Git | Github | Gitlab'],
                  autoStart: true,
                  delay: 100,
                  loop: true,
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <div className='wrap'>
            {

              arr.map((item, index) => {
                return <div className='c' key={index}></div>
              })
            }

          </div>
        </div>
      </div>
    </>
  )
}

export default Profile