import React from 'react'

const Profile = () => {
  const arr = new Array(300).fill(0)
  console.log(arr);
  return (
    <>
    <div className='header'>
      <div className='top_Section'>
        <div>
          <div className='title'>
            <h1>JAY PAVASIYA</h1>
          </div>
          <div className='sub_title'>
            <p>Developer</p>
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
    {/* <div>
      <h1>dfjksdg</h1>
    </div> */}
    </>
  )
}

export default Profile